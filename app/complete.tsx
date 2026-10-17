import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PrimaryButton } from '@/components/Ui';
import { useBhak } from '@/context/BhakContext';
import { useColors } from '@/hooks/useColors';
import { usePracticeQueue } from '@/lib/practice/usePracticeQueue';

export default function Complete() {
  const colors=useColors();const insets=useSafeAreaInsets();
  const {submitNaamJap,submitMeditation,streak,refresh}=useBhak();
  const queue=usePracticeQueue();
  const params=useLocalSearchParams<{kind?:string;count?:string;targetRepetitions?:string;startedAt?:string;durationSeconds?:string;plannedMinutes?:string;actualSeconds?:string}>();
  const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);const [error,setError]=useState<string|null>(null);
  const kind=params.kind==='meditation'?'meditation':'jap';
  const done=async()=>{
    if(saved){await refresh();router.replace('/(tabs)');return;}
    setSaving(true);setError(null);
    try {
      const endedAt=new Date().toISOString();
      const startedAt=params.startedAt??endedAt;
      if(kind==='jap'){
        const targetRepetitions=Math.max(1,Number(params.targetRepetitions)||108);
        const count=Math.max(1,Math.min(targetRepetitions,Number(params.count)||targetRepetitions));
        await submitNaamJap({targetRepetitions,completedRepetitions:count,startedAt,endedAt,durationSeconds:Math.max(0,Number(params.durationSeconds)||0),completed:count>=108});
      } else {
        const plannedMinutes=Math.max(1,Number(params.plannedMinutes)||5);
        const actualSeconds=Math.max(1,Math.min(plannedMinutes*60,Number(params.actualSeconds)||plannedMinutes*60));
        await submitMeditation({plannedMinutes,actualSeconds,startedAt,endedAt,completed:true,completionReason:'completed'});
      }
      setSaved(true);
      await refresh();
      router.replace('/(tabs)');
    } catch(cause) {
      setError(cause instanceof Error?cause.message:'Could not save this practice yet.');
    } finally {setSaving(false);}
  };
  return <View style={[local.wrap,{backgroundColor:colors.background,paddingTop:insets.top+30,paddingBottom:insets.bottom+22}]}>
    <View style={local.content}><BrandMark/><Text style={[local.eyebrow,{color:colors.primary}]}>A MOMENT KEPT</Text><Text style={[local.title,{color:colors.foreground}]}>Practice complete.</Text><Text style={[local.detail,{color:colors.mutedForeground}]}>May peace remain with you throughout the day.</Text>
      <View style={[local.streak,{borderColor:colors.border}]}><Text style={[local.streakNumber,{color:colors.foreground}]}>{streak.current}</Text><Text style={[local.streakLabel,{color:colors.mutedForeground}]}>days of returning</Text></View>
      {queue.pending>0?<Text style={[local.status,{color:colors.mutedForeground}]}>{queue.syncing?'Syncing saved practice…':`${queue.pending} practice submission(s) saved on this device and waiting to sync.`}</Text>:null}
      {queue.lastError?<Text style={[local.error,{color:colors.destructive}]}>{queue.lastError}</Text>:null}
      {error?<Text style={[local.error,{color:colors.destructive}]}>{error}</Text>:null}
    </View>
    <View>{saving?<ActivityIndicator color={colors.primary}/>:null}<PrimaryButton label={saving?'Saving…':'Done'} onPress={()=>void done()} icon="check"/></View>
  </View>;
}
const local=StyleSheet.create({wrap:{flex:1,paddingHorizontal:24,justifyContent:'space-between'},content:{alignItems:'center',justifyContent:'center',flex:1},eyebrow:{fontSize:11,letterSpacing:1.4,fontFamily:'Inter_700Bold',marginTop:30},title:{fontSize:32,letterSpacing:-0.7,fontFamily:'Inter_700Bold',marginTop:13,textAlign:'center'},detail:{fontSize:16,lineHeight:26,fontFamily:'Inter_400Regular',textAlign:'center',maxWidth:285,marginTop:14},streak:{borderWidth:1,borderRadius:20,paddingHorizontal:27,paddingVertical:16,alignItems:'center',marginTop:36},streakNumber:{fontSize:27,fontFamily:'Inter_700Bold'},streakLabel:{fontSize:12,fontFamily:'Inter_400Regular',marginTop:5},status:{fontSize:13,lineHeight:20,textAlign:'center',marginTop:18},error:{fontSize:13,lineHeight:20,textAlign:'center',marginTop:12}});
