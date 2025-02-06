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

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
      >
        <View className="px-6 pt-4 pb-6 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            Notifications
          </Text>
        </View>

        <View className="px-6 py-4">
          <View className="gap-3">
            {/* High Priority Alert */}
            <TouchableOpacity className="bg-red-50 rounded-2xl overflow-hidden">
              <View className="flex-row items-start p-4">
                <View className="bg-white p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="bug"
                    size={24}
                    color="#dc2626"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-red-700 font-medium">Pest Alert</Text>
                    <Text className="text-red-600 text-xs">10 min ago</Text>
                  </View>
                  <Text className="text-red-600 text-sm">
                    High pest activity detected in Farm 1 (Wheat Field)
                  </Text>
                  <View className="flex-row mt-3">
                    <TouchableOpacity className="bg-red-100 px-3 py-1 rounded-full mr-2">
                      <Text className="text-red-700 text-xs font-medium">
                        Take Action
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white px-3 py-1 rounded-full">
                      <Text className="text-red-700 text-xs">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Medium Priority Alert */}
            <TouchableOpacity className="bg-yellow-50 rounded-2xl overflow-hidden">
              <View className="flex-row items-start p-4">
                <View className="bg-white p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="water-alert"
                    size={24}
                    color="#a16207"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-yellow-700 font-medium">
                      Irrigation Alert
                    </Text>
                    <Text className="text-yellow-600 text-xs">2h ago</Text>
                  </View>
                  <Text className="text-yellow-600 text-sm">
                    Soil moisture below optimal level in Farm 1
                  </Text>
                  <View className="flex-row mt-3">
                    <TouchableOpacity className="bg-yellow-100 px-3 py-1 rounded-full mr-2">
                      <Text className="text-yellow-700 text-xs font-medium">
                        Schedule Irrigation
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white px-3 py-1 rounded-full">
                      <Text className="text-yellow-700 text-xs">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Info Alert */}
            <TouchableOpacity className="bg-blue-50 rounded-2xl overflow-hidden">
              <View className="flex-row items-start p-4">
                <View className="bg-white p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="weather-cloudy-alert"
                    size={24}
                    color="#1d4ed8"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-blue-700 font-medium">
                      Weather Update
                    </Text>
                    <Text className="text-blue-600 text-xs">5h ago</Text>
                  </View>
                  <Text className="text-blue-600 text-sm">
                    Light rain expected in the next 24 hours
                  </Text>
                  <View className="flex-row mt-3">
                    <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full mr-2">
                      <Text className="text-blue-700 text-xs font-medium">
                        View Forecast
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white px-3 py-1 rounded-full">
                      <Text className="text-blue-700 text-xs">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
