import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';

export default function FarmDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getFarmById } = useFarmStore();
  const farm = getFarmById(id as string);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Farm not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" backgroundColor="transparent" />
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="flex-1 bg-white"
          contentContainerStyle={{
            paddingBottom: 80,
          }}
        >
          {/* Header */}
          <View className="pb-4">
            <View className="px-6 pt-4 pb-2">
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mr-3"
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color="#4d7c0f"
                  />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {farm.name}
                  </Text>
                  <Text className="text-sm text-lima-600 mt-1">
                    {farm.area} acres • {farm.growthStage.stage}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    farm.status === 'Healthy'
                      ? 'bg-lima-100'
                      : farm.status === 'Needs Attention'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      farm.status === 'Healthy'
                        ? 'text-lima-700'
                        : farm.status === 'Needs Attention'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}
                  >
                    {farm.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="px-6">
            {/* Key Metrics */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Key Metrics
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {/* NDVI Score */}
                <View className="flex-1 min-w-[45%] bg-lima-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lima-700 font-medium">
                      NDVI Score
                    </Text>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={20}
                      color="#4d7c0f"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-lima-700">
                    {farm.metrics.ndviScore}
                  </Text>
                  <Text className="text-lima-600 text-xs mt-1">
                    {farm.metrics.ndviScore > 0.8
                      ? 'Excellent Health'
                      : farm.metrics.ndviScore > 0.6
                      ? 'Good Health'
                      : 'Needs Attention'}
                  </Text>
                </View>

                {/* Water Stress */}
                <View className="flex-1 min-w-[45%] bg-blue-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-blue-700 font-medium">
                      Water Stress
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        farm.metrics.waterStress.level === 'High'
                          ? 'water-alert'
                          : 'water'
                      }
                      size={20}
                      color="#2563eb"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-blue-700">
                    {farm.metrics.waterStress.level}
                  </Text>
                  <Text className="text-blue-600 text-xs mt-1">
                    {farm.metrics.waterStress.value.toFixed(2)} index
                  </Text>
                </View>

                {/* Nitrogen Levels */}
                <View className="flex-1 min-w-[45%] bg-purple-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-purple-700 font-medium">
                      Nitrogen
                    </Text>
                    <MaterialCommunityIcons
                      name="molecule"
                      size={20}
                      color="#7c3aed"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-purple-700">
                    {farm.metrics.nitrogen.value}
                  </Text>
                  <Text className="text-purple-600 text-xs mt-1">
                    kg/ha • {farm.metrics.nitrogen.status}
                  </Text>
                </View>

                {/* Disease Risk */}
                <View className="flex-1 min-w-[45%] bg-yellow-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-yellow-700 font-medium">
                      Disease Risk
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        farm.metrics.diseaseRisk.status === 'Low'
                          ? 'shield-check'
                          : 'shield-alert'
                      }
                      size={20}
                      color="#a16207"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-yellow-700">
                    {farm.metrics.diseaseRisk.percentage}%
                  </Text>
                  <Text className="text-yellow-600 text-xs mt-1">
                    {farm.metrics.diseaseRisk.status} risk level
                  </Text>
                </View>
              </View>
            </View>

            {/* Growth Timeline */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Growth Timeline
              </Text>
              <View className="flex-row items-center mb-2">
                <View className="h-1 flex-1 bg-lima-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-lima-600 rounded-full"
                    style={{
                      width: `${(farm.growthStage.days / 120) * 100}%`,
                    }}
                  />
                </View>
                <Text className="ml-3 text-lima-700 font-medium">
                  {farm.growthStage.days} days
                </Text>
              </View>
              <Text className="text-sm text-lima-600">
                Current stage: {farm.growthStage.stage}
              </Text>
            </View>

            {/* Next Actions */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Next Actions
              </Text>
              <View className="gap-3">
                {farm.nextIrrigation && (
                  <TouchableOpacity className="flex-row items-center bg-blue-50 p-3 rounded-xl">
                    <MaterialCommunityIcons
                      name="timer-outline"
                      size={24}
                      color="#2563eb"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-blue-900 font-medium">
                        Scheduled Irrigation
                      </Text>
                      <Text className="text-blue-600 text-sm">
                        {new Date(farm.nextIrrigation).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#2563eb"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity className="flex-row items-center bg-lima-50 p-3 rounded-xl">
                  <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="#4d7c0f"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-lima-900 font-medium">
                      Scan Crop Health
                    </Text>
                    <Text className="text-lima-600 text-sm">
                      Last scan: 2 days ago
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#4d7c0f"
                  />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center bg-purple-50 p-3 rounded-xl">
                  <MaterialCommunityIcons
                    name="test-tube"
                    size={24}
                    color="#7c3aed"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-purple-900 font-medium">
                      Soil Analysis Due
                    </Text>
                    <Text className="text-purple-600 text-sm">
                      Schedule next test
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#7c3aed"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
