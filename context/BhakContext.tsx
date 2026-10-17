import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultPreferences, DailyCompletion, PracticeKind, Streak, UserPreferences } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { ApiError } from '@/lib/api/client';
import { ApiPreferences, HomeToday, getHomeToday, getPreferences, savePreferences } from '@/lib/preferences/preferencesApi';

const HISTORY_KEY = '@bhak/history';
interface BhakContextValue {
  preferences: UserPreferences; history: DailyCompletion[]; streak: Streak; home: HomeToday | null;
  loading: boolean; savingPreferences: boolean; error: string | null; refresh: () => Promise<void>;
  updatePreferences: (next: Partial<UserPreferences>) => Promise<void>;
  updateEnabled: (kind: PracticeKind, enabled: boolean) => Promise<void>;
  completePractice: (kind: PracticeKind) => void; resetData: () => void;
}
const BhakContext = createContext<BhakContextValue | null>(null);
function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function calculateStreak(history: DailyCompletion[]): Streak {
  const active = new Set(history.filter((day) => day.completed.length > 0).map((day) => day.date));
  let current = 0; const cursor = new Date();
  while (active.has(dateKey(cursor))) { current += 1; cursor.setDate(cursor.getDate()-1); }
  let longest = 0; let run = 0; const sorted = [...active].sort();
  sorted.forEach((date,index) => { if(index>0){const days=Math.round((new Date(date).getTime()-new Date(sorted[index-1]).getTime())/86400000);run=days===1?run+1:1;}else run=1;longest=Math.max(longest,run); });
  return { current, longest };
}
function fromApiPreferences(value: ApiPreferences, traditions: Array<{id:string;key:string;name:string}>, focuses: Array<{id:string;key:string;name:string;traditionIds:string[]}>): UserPreferences {
  const tradition=traditions.find((item)=>item.id===value.traditionId);
  const focus=focuses.find((item)=>item.id===value.primaryFocusId);
  return {
    hasOnboarded:true,
    path:/jain/i.test(`${tradition?.key??''} ${tradition?.name??''}`)?'Jain':'Hindu',
    focus:focus?.name??focus?.key??defaultPreferences.focus,
    enabled:{reading:false,jap:(value.enabledPractices??[]).includes('naam_jap'),meditation:(value.enabledPractices??[]).includes('meditation')},
    reminderTime:value.reminder?.localTime??'07:00',notifications:value.reminder?.enabled??false,language:'English',
  };
}
function errorMessage(error: unknown) { return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Could not load or save server data. Please try again.'; }

export function BhakProvider({children}:{children:ReactNode}) {
  const {status:authStatus}=useAuth();
  const {bootstrap,status:bootstrapStatus}=useBootstrap();
  const [preferences,setPreferences]=useState<UserPreferences>(defaultPreferences);
  const [history,setHistory]=useState<DailyCompletion[]>([]);
  const [home,setHome]=useState<HomeToday|null>(null);
  const [loading,setLoading]=useState(true);
  const [savingPreferences,setSavingPreferences]=useState(false);
  const [error,setError]=useState<string|null>(null);

  const refresh=useCallback(async()=>{
    if(authStatus!=='authenticated'||bootstrapStatus!=='ready'||!bootstrap)return;
    setLoading(true);setError(null);
    try {
      const [prefs,homeToday]=await Promise.all([getPreferences(),getHomeToday()]);
      setPreferences(fromApiPreferences(prefs,bootstrap.traditions,bootstrap.focuses));setHome(homeToday);
    } catch(cause) { setError(errorMessage(cause)); }
    finally { setLoading(false); }
  },[authStatus,bootstrapStatus,bootstrap]);

  useEffect(()=>{if(authStatus==='authenticated'&&bootstrapStatus==='ready')void refresh();},[authStatus,bootstrapStatus,refresh]);
  useEffect(()=>{AsyncStorage.getItem(HISTORY_KEY).then((saved)=>{if(saved)setHistory(JSON.parse(saved));}).catch(()=>undefined);},[]);

  const updatePreferences=useCallback(async(next:Partial<UserPreferences>)=>{
    if(!bootstrap)throw new Error('Server configuration is not ready.');
    const merged={...preferences,...next,enabled:{...preferences.enabled,...(next.enabled??{})}};
    const tradition=bootstrap.traditions.find((item)=>/jain/i.test(`${item.key} ${item.name}`)===(merged.path==='Jain'))??bootstrap.traditions[0];
    const focus=bootstrap.focuses.find((item)=>item.name.toLowerCase()===merged.focus.toLowerCase()||item.key.toLowerCase()===merged.focus.toLowerCase())??bootstrap.focuses.find((item)=>tradition&&item.traditionIds.includes(tradition.id));
    if(!tradition)throw new Error('No spiritual traditions are available in server configuration.');
    const enabledPractices:Array<'naam_jap'|'meditation'>=[];
    if(merged.enabled.jap)enabledPractices.push('naam_jap');
    if(merged.enabled.meditation)enabledPractices.push('meditation');
    if(!enabledPractices.length)throw new Error('Enable at least one available practice.');
    setSavingPreferences(true);setError(null);
    try {
      const saved=await savePreferences({traditionId:tradition.id,...(focus?{primaryFocusId:focus.id}:{}),enabledPractices,reminder:{enabled:merged.notifications,localTime:merged.reminderTime}});
      setPreferences(fromApiPreferences(saved,bootstrap.traditions,bootstrap.focuses));
      setHome(await getHomeToday());
    } catch(cause) {setError(errorMessage(cause));throw cause;}
    finally {setSavingPreferences(false);}
  },[bootstrap,preferences]);

  const updateEnabled=useCallback((kind:PracticeKind,enabled:boolean)=>{
    if(kind==='reading')return Promise.reject(new Error('Reading is not supported by the current API.'));
    return updatePreferences({enabled:{...preferences.enabled,[kind]:enabled}});
  },[preferences.enabled,updatePreferences]);

  const completePractice=(kind:PracticeKind)=>{
    setHistory((current)=>{const today=dateKey();const existing=current.find((day)=>day.date===today);
      const next=existing?current.map((day)=>day.date===today&&!day.completed.includes(kind)?{...day,completed:[...day.completed,kind]}:day):[...current,{date:today,completed:[kind]}];
      void AsyncStorage.setItem(HISTORY_KEY,JSON.stringify(next));return next;});
  };
  const resetData=()=>{setHistory([]);void AsyncStorage.removeItem(HISTORY_KEY);void refresh();};
  const value=useMemo(()=>({preferences,history,streak:calculateStreak(history),home,loading,savingPreferences,error,refresh,updatePreferences,updateEnabled,completePractice,resetData}),
    [preferences,history,home,loading,savingPreferences,error,refresh,updatePreferences,updateEnabled]);
  return <BhakContext.Provider value={value}>{children}</BhakContext.Provider>;
}
export function useBhak(){const value=useContext(BhakContext);if(!value)throw new Error('useBhak must be used inside BhakProvider');return value;}
