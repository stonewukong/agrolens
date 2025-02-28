import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DiseaseController from '@/app/components/DiseaseController';
import { useTranslation } from 'react-i18next';

export default function DiseaseDetectionScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="transparent" />
      <View className="flex-1">
        <DiseaseController />
      </View>
    </SafeAreaView>
  );
}
