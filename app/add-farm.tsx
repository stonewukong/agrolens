import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';

export default function AddFarmScreen() {
  const router = useRouter();
  const { addFarm } = useFarmStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wheat' as 'Wheat' | 'Rice' | 'Corn' | 'Other',
    area: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
    },
    plantingDate: new Date(),
  });

  const handleSubmit = () => {
    const newFarm = {
      name: formData.name,
      type: formData.type,
      area: Number(formData.area),
      location: {
        latitude: Number(formData.location.latitude),
        longitude: Number(formData.location.longitude),
        address: formData.location.address,
      },
      status: 'Healthy' as const,
      growthStage: {
        days: 0,
        stage: 'Seedling' as const,
        expectedHarvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        totalDuration: 120,
      },
      metrics: {
        ndviScore: 0,
        waterStress: {
          level: 'Low' as const,
          value: 0,
        },
        nitrogen: {
          value: 0,
          status: 'Adequate' as const,
        },
        diseaseRisk: {
          percentage: 0,
          status: 'Low' as const,
        },
        lastScanDate: new Date(),
        lastSoilTest: new Date(),
      },
      weather: {
        temperature: 0,
        humidity: 0,
        rainfall: 0,
        lastUpdated: new Date(),
      },
      tasks: [],
      lastUpdated: new Date(),
      plantingDate: formData.plantingDate,
      icon: formData.type.toLowerCase() as 'grain' | 'sprout' | 'corn' | 'seed',
      notes: ['Farm created'],
    };

    addFarm(newFarm);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#4d7c0f"
              />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Add New Farm
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="p-6">
          {/* Farm Name */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Farm Name
            </Text>
            <TextInput
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter farm name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
            />
          </View>

          {/* Farm Type */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Farm Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['Wheat', 'Rice', 'Corn', 'Other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: type as typeof formData.type,
                    }))
                  }
                  className={`px-4 py-2 rounded-full ${
                    formData.type === type
                      ? 'bg-lima-100 border-lima-200'
                      : 'bg-gray-50 border-gray-100'
                  } border`}
                >
                  <Text
                    className={`${
                      formData.type === type ? 'text-lima-700' : 'text-gray-600'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Area */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Area (acres)
            </Text>
            <TextInput
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter area in acres"
              keyboardType="numeric"
              value={formData.area}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, area: text }))
              }
            />
          </View>

          {/* Location */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Location
            </Text>
            <View className="gap-3">
              <TextInput
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Latitude"
                keyboardType="numeric"
                value={formData.location.latitude}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: { ...prev.location, latitude: text },
                  }))
                }
              />
              <TextInput
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Longitude"
                keyboardType="numeric"
                value={formData.location.longitude}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: { ...prev.location, longitude: text },
                  }))
                }
              />
              <TextInput
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Address"
                value={formData.location.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: { ...prev.location, address: text },
                  }))
                }
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-lima-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-medium">Add Farm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
