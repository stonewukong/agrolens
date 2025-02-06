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

export default function FarmsScreen() {
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
        {/* Header with Add Farm Button */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">My Farms</Text>
          <TouchableOpacity
            className="bg-lima-500 p-2 rounded-full"
            onPress={() => {
              /* Add navigation to add farm form */
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Farm List */}
        <View className="px-6 py-6">
          <View className="gap-4">
            {/* Farm Card 1 */}
            <TouchableOpacity className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium text-gray-900">Farm 1</Text>
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-700 text-xs">Healthy</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-sm">Wheat (45 days)</Text>
              <Text className="text-gray-600 text-sm">2.5 acres</Text>
              <View className="flex-row mt-4 gap-2">
                <TouchableOpacity className="flex-1 bg-lima-50 p-2 rounded-lg flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={20}
                    color="#65a30d"
                  />
                  <Text className="text-lima-700 ml-2">Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-lima-50 p-2 rounded-lg flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#65a30d"
                  />
                  <Text className="text-lima-700 ml-2">Edit</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Farm Card 2 */}
            <TouchableOpacity className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium text-gray-900">Farm 2</Text>
                <View className="bg-yellow-100 px-2 py-1 rounded-full">
                  <Text className="text-yellow-700 text-xs">
                    Check Irrigation
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 text-sm">Rice (Seedling)</Text>
              <Text className="text-gray-600 text-sm">1.8 acres</Text>
              <View className="flex-row mt-4 gap-2">
                <TouchableOpacity className="flex-1 bg-lima-50 p-2 rounded-lg flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={20}
                    color="#65a30d"
                  />
                  <Text className="text-lima-700 ml-2">Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-lima-50 p-2 rounded-lg flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="#65a30d"
                  />
                  <Text className="text-lima-700 ml-2">Edit</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
