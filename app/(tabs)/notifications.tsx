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
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Notifications
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              You have 3 new alerts
            </Text>
          </View>
          <TouchableOpacity className="bg-lima-600 p-2 rounded-xl">
            <MaterialCommunityIcons name="check-all" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Today's Notifications */}
        <View className="px-6 mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-3">TODAY</Text>
          <View className="gap-3">
            {/* High Priority Alert */}
            <TouchableOpacity className="bg-white rounded-2xl border border-red-100">
              <View className="flex-row p-4">
                <View className="bg-red-50 p-1 rounded-xl">
                  <MaterialCommunityIcons
                    name="bug"
                    size={24}
                    color="#dc2626"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-gray-900 font-medium">
                        Pest Alert
                      </Text>
                      <View className="bg-red-100 px-2 py-0.5 rounded-full">
                        <Text className="text-red-700 text-xs">High</Text>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-xs">10m ago</Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">
                    High pest activity detected in Wheat Field
                  </Text>
                  <View className="flex-row mt-3 gap-2">
                    <TouchableOpacity className="bg-red-600 px-3 py-1.5 rounded-lg flex-row items-center">
                      <MaterialCommunityIcons
                        name="alert"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-sm font-medium ml-1">
                        Take Action
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Text className="text-gray-600 text-sm">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Medium Priority Alert */}
            <TouchableOpacity className="bg-white rounded-2xl border border-yellow-100">
              <View className="flex-row p-4">
                <View className="bg-yellow-50 p-1 rounded-xl">
                  <MaterialCommunityIcons
                    name="water-alert"
                    size={24}
                    color="#a16207"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-gray-900 font-medium">
                        Irrigation Alert
                      </Text>
                      <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Text className="text-yellow-700 text-xs">Medium</Text>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-xs">2h ago</Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">
                    Soil moisture below optimal level in Rice Field
                  </Text>
                  <View className="flex-row mt-3 gap-2">
                    <TouchableOpacity className="bg-lima-600 px-3 py-1.5 rounded-lg flex-row items-center">
                      <MaterialCommunityIcons
                        name="water"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-sm font-medium ml-1">
                        Schedule Water
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Text className="text-gray-600 text-sm">Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earlier Notifications */}
        <View className="px-6">
          <Text className="text-sm font-medium text-gray-500 mb-3">
            EARLIER
          </Text>
          <View className="gap-3">
            {/* Info Alert */}
            <TouchableOpacity className="bg-white rounded-2xl border border-blue-100">
              <View className="flex-row p-4">
                <View className="bg-blue-50 p-1 rounded-xl">
                  <MaterialCommunityIcons
                    name="weather-cloudy"
                    size={24}
                    color="#2563eb"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-gray-900 font-medium">
                        Weather Update
                      </Text>
                      <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                        <Text className="text-blue-700 text-xs">Info</Text>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-xs">5h ago</Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">
                    Light rain expected tomorrow morning
                  </Text>
                  <View className="flex-row mt-3 gap-2">
                    <TouchableOpacity className="bg-blue-600 px-3 py-1.5 rounded-lg flex-row items-center">
                      <MaterialCommunityIcons
                        name="weather-cloudy"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-sm font-medium ml-1">
                        View Forecast
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Text className="text-gray-600 text-sm">Dismiss</Text>
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
