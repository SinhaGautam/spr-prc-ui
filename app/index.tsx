import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useBhak } from '@/context/BhakContext';

export default function Entry() {
  const { preferences, loading } = useBhak();
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={preferences.hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}