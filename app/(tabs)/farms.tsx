import React from 'react';
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
import { useRouter } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';
import Skeleton from '@/app/components/Skeleton';

export default function FarmsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();
  const { farms } = useFarmStore();
  const [loading, setLoading] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const FarmListSkeleton = () => (
    <View className="px-6">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4"
        >
          <View className="flex-row items-start">
            <Skeleton
              width={48}
              height={48}
              borderRadius={12}
              className="mr-4"
            />
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <View>
                  <Skeleton width={120} height={24} className="mb-2" />
                  <Skeleton width={80} height={16} />
                </View>
                <Skeleton width={60} height={24} borderRadius={20} />
              </View>
              <View className="flex-row mt-4 gap-4">
                <Skeleton width="30%" height={40} borderRadius={8} />
                <Skeleton width="30%" height={40} borderRadius={8} />
                <Skeleton width="30%" height={40} borderRadius={8} />
              </View>
              <View className="flex-row gap-2 mt-4">
                <Skeleton width="48%" height={36} borderRadius={8} />
                <Skeleton width="48%" height={36} borderRadius={8} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
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
        {/* Header with Add Farm Button */}
        <View className="pb-4">
          {/* Background Pattern */}
          <View
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, #65a30d 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <View className="px-6 pt-4 pb-2 relative">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  My Farms
                </Text>
                <Text className="text-sm text-lima-600 mt-1">
                  Managing {farms.length} active farms
                </Text>
              </View>
              <TouchableOpacity
                className="bg-lima-700 p-2 rounded-xl"
                onPress={() => router.push('/add-farm')}
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Farm List */}
        {loading ? (
          <FarmListSkeleton />
        ) : (
          <View className="px-6">
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4"
                onPress={() =>
                  router.push({
                    pathname: '/[id]',
                    params: { id: farm.id },
                  })
                }
              >
                <View className="flex-row items-start">
                  {/* Farm Icon */}
                  <View className="bg-lima-50 p-3 rounded-xl">
                    <MaterialCommunityIcons
                      name={farm.icon}
                      size={24}
                      color="#4d7c0f"
                    />
                  </View>

                  {/* Farm Info */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className="text-lg font-bold text-gray-900">
                          {farm.name}
                        </Text>
                        <Text className="text-lima-600 text-sm">
                          {farm.area} acres • {farm.growthStage.days} days old
                        </Text>
                      </View>
                      <View
                        className={`px-2.5 py-1 rounded-full ${
                          farm.status === 'Healthy'
                            ? 'bg-lima-100'
                            : farm.status === 'Needs Attention'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
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

                    {/* Quick Stats */}
                    <View className="flex-row mt-4 gap-4">
                      <View className="flex-1 flex-row items-center">
                        <View className="bg-lima-50 p-1.5 rounded-lg mr-2">
                          <MaterialCommunityIcons
                            name="leaf"
                            size={16}
                            color="#4d7c0f"
                          />
                        </View>
                        <View>
                          <Text className="text-xs text-lima-600">NDVI</Text>
                          <Text className="text-base font-semibold text-lima-700">
                            {farm.metrics.ndviScore}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 flex-row items-center">
                        <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                          <MaterialCommunityIcons
                            name="water"
                            size={16}
                            color="#2563eb"
                          />
                        </View>
                        <View>
                          <Text className="text-xs text-blue-600">Water</Text>
                          <Text className="text-base font-semibold text-blue-700">
                            {farm.metrics.waterStress.level}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-1 flex-row items-center">
                        <View className="bg-yellow-50 p-1.5 rounded-lg mr-2">
                          <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={16}
                            color="#a16207"
                          />
                        </View>
                        <View>
                          <Text className="text-xs text-yellow-600">Risk</Text>
                          <Text className="text-base font-semibold text-yellow-700">
                            {farm.metrics.diseaseRisk.percentage}%
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 mt-4">
                      <TouchableOpacity className="flex-1 bg-lima-50 py-2 rounded-lg flex-row justify-center items-center">
                        <MaterialCommunityIcons
                          name="chart-line"
                          size={16}
                          color="#4d7c0f"
                        />
                        <Text className="text-lima-700 font-medium text-sm ml-1">
                          Analytics
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-lima-50 py-2 rounded-lg flex-row justify-center items-center">
                        <MaterialCommunityIcons
                          name="cog"
                          size={16}
                          color="#4d7c0f"
                        />
                        <Text className="text-lima-700 font-medium text-sm ml-1">
                          Manage
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
