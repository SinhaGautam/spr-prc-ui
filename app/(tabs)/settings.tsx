import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View, ActivityIndicator } from 'react-native';
import { Screen, styles as ui } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { useColors } from '@/hooks/useColors';

export default function Settings() {
  const colors=useColors();
  const {preferences,updatePreferences,savingPreferences,error,loading,refresh}=useBhak();
  const {bootstrap,isPracticeAvailable}=useBootstrap();
  const traditions=bootstrap?.traditions??[];
  const selectedTradition=traditions.find((item)=>/jain/i.test(`${item.key} ${item.name}`)===(preferences.path==='Jain'))??traditions[0];
  const focuses=(bootstrap?.focuses??[]).filter((item)=>!selectedTradition||item.traditionIds.includes(selectedTradition.id));
  const save=async(next:Parameters<typeof updatePreferences>[0])=>{try{await updatePreferences(next);}catch{/* Error is shown from shared context. */}};
  const cycleTime=()=>{const times=['06:00','07:00','08:00','09:00','18:00','19:00','20:00'];const index=times.indexOf(preferences.reminderTime);void save({reminderTime:times[(index+1)%times.length]});};
  if(loading) return <Screen><View style={local.state}><ActivityIndicator color={colors.primary}/><Text style={[local.detail,{color:colors.mutedForeground}]}>Loading your saved preferences…</Text></View></Screen>;
  if(error) return <Screen><Text style={[ui.eyebrow,{color:colors.primary,marginTop:32}]}>YOUR SPACE</Text><Text style={[ui.title,{color:colors.foreground}]}>Settings</Text><View style={[local.error,{borderColor:colors.border}]}><Text style={[local.detail,{color:colors.destructive}]}>{error}</Text><Pressable onPress={()=>void refresh()}><Text style={[local.action,{color:colors.primary}]}>Try again</Text></Pressable></View></Screen>;
  return <Screen>
    <Text style={[ui.eyebrow,{color:colors.primary,marginTop:32}]}>YOUR SPACE</Text>
    <Text style={[ui.title,{color:colors.foreground}]}>Settings</Text>
    <Text style={[ui.detail,{color:colors.mutedForeground}]}>Your preferences are saved to your Bhak account.</Text>
    {savingPreferences?<View style={local.saving}><ActivityIndicator color={colors.primary}/><Text style={[local.detail,{color:colors.mutedForeground}]}>Saving changes…</Text></View>:null}
    {error?<View style={[local.error,{borderColor:colors.border}]}><Text style={[local.detail,{color:colors.destructive}]}>{error}</Text><Pressable onPress={()=>void refresh()}><Text style={[local.action,{color:colors.primary}]}>Reload from server</Text></Pressable></View>:null}
    <Text style={[local.section,{color:colors.foreground}]}>Spiritual path</Text>
    <View style={[local.group,{backgroundColor:colors.card,borderColor:colors.border}]}>
      {traditions.map((item)=><Choice key={item.id} label={item.name} selected={selectedTradition?.id===item.id} onPress={()=>{const firstFocus=(bootstrap?.focuses??[]).find((f)=>f.traditionIds.includes(item.id));void save({path:/jain/i.test(`${item.key} ${item.name}`)?'Jain':'Hindu',...(firstFocus?{focus:firstFocus.name}:{})});}}/>)}
    </View>
    <Text style={[local.section,{color:colors.foreground}]}>Primary focus</Text>
    <View style={[local.group,{backgroundColor:colors.card,borderColor:colors.border}]}>
      {focuses.map((item)=><Choice key={item.id} label={item.name} selected={preferences.focus.toLowerCase()===item.name.toLowerCase()||preferences.focus.toLowerCase()===item.key.toLowerCase()} onPress={()=>void save({focus:item.name})}/>)}
    </View>
    <Text style={[local.section,{color:colors.foreground}]}>Daily practices</Text>
    <View style={[local.group,{backgroundColor:colors.card,borderColor:colors.border}]}>
      <Toggle label="Naam Jap" detail="Repetition and mantra practice" value={preferences.enabled.jap} available={isPracticeAvailable('naam_jap')} onChange={(value)=>void save({enabled:{...preferences.enabled,jap:value}})}/>
      <Toggle label="Meditation" detail="Quiet time for stillness" value={preferences.enabled.meditation} available={isPracticeAvailable('meditation')} onChange={(value)=>void save({enabled:{...preferences.enabled,meditation:value}}}/>
    </View>
    <Text style={[local.section,{color:colors.foreground}]}>Daily reminder</Text>
    <View style={[local.group,{backgroundColor:colors.card,borderColor:colors.border}]}>
      <View style={local.row}><View style={{flex:1}}><Text style={[local.label,{color:colors.foreground}]}>Notifications</Text><Text style={[local.detail,{color:colors.mutedForeground}]}>A gentle daily reminder</Text></View><Switch value={preferences.notifications} onValueChange={(value)=>void save({notifications:value})} trackColor={{false:colors.border,true:colors.accent}} thumbColor={preferences.notifications?colors.primary:colors.mutedForeground}/></View>
      <Pressable disabled={!preferences.notifications} onPress={cycleTime} style={local.row}><Text style={[local.label,{color:colors.foreground}]}>Reminder time</Text><Text style={[local.action,{color:preferences.notifications?colors.primary:colors.mutedForeground}]}>{preferences.reminderTime}  ›</Text></Pressable>
    </View>
  </Screen>;
}
function Choice({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}){const colors=useColors();return <Pressable onPress={onPress} style={[local.choice,{borderBottomColor:colors.border}]}><Text style={[local.label,{color:colors.foreground}]}>{label}</Text><View style={[local.radio,{borderColor:selected?colors.primary:colors.border,backgroundColor:selected?colors.primary:'transparent'}]}>{selected?<Text style={local.check}>✓</Text>:null}</View></Pressable>;}
function Toggle({label,detail,value,available,onChange}:{label:string;detail:string;value:boolean;available:boolean;onChange:(value:boolean)=>void}){const colors=useColors();return <View style={local.row}><View style={{flex:1}}><Text style={[local.label,{color:colors.foreground}]}>{label}</Text><Text style={[local.detail,{color:colors.mutedForeground}]}>{available?detail:'Unavailable in the current server configuration'}</Text></View><Switch disabled={!available} value={value&&available} onValueChange={onChange} trackColor={{false:colors.border,true:colors.accent}} thumbColor={value?colors.primary:colors.mutedForeground}/></View>;}
const local=StyleSheet.create({
 section:{fontSize:16,fontFamily:'Inter_600SemiBold',marginTop:26,marginBottom:10},group:{borderWidth:1,borderRadius:18,overflow:'hidden'},row:{minHeight:62,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:16,borderBottomWidth:1,borderBottomColor:'rgba(120,120,120,0.15)'},choice:{minHeight:52,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1},label:{fontSize:15,fontFamily:'Inter_500Medium'},detail:{fontSize:12,lineHeight:18,fontFamily:'Inter_400Regular',marginTop:4},action:{fontSize:14,fontFamily:'Inter_600SemiBold'},radio:{width:21,height:21,borderWidth:1.5,borderRadius:11,alignItems:'center',justifyContent:'center'},check:{fontSize:12,color:'#fffdf8',fontFamily:'Inter_700Bold'},state:{flex:1,alignItems:'center',justifyContent:'center',padding:28,gap:12},saving:{flexDirection:'row',alignItems:'center',gap:10,marginTop:14},error:{borderWidth:1,borderRadius:14,padding:14,gap:10,marginTop:14}
});
