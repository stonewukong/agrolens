import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface DetectionResult {
  diseaseName: string;
  accuracy: number;
  recommendations?: string[];
}

interface DiseaseViewProps {
  image: string;
  result: DetectionResult | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAnalyze: () => void;
}

export default function DiseaseView({
  image,
  result,
  loading,
  error,
  onRetry,
  onAnalyze,
}: DiseaseViewProps) {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1">
      {/* Image Preview */}
      <View className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4">
        <Image
          source={{ uri: image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Analysis Section */}
      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#4d7c0f" />
          <Text className="text-lima-600 mt-4">
            {t('diseaseDetection.analyzing')}
          </Text>
        </View>
      ) : error ? (
        <View className="items-center py-8">
          <View className="bg-red-50 p-4 rounded-xl mb-4">
            <MaterialCommunityIcons
              name="alert-circle"
              size={32}
              color="#dc2626"
            />
            <Text className="text-red-600 mt-2">{error}</Text>
          </View>
          <TouchableOpacity
            onPress={onRetry}
            className="bg-lima-600 px-6 py-3 rounded-xl flex-row items-center"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="white" />
            <Text className="text-white font-medium ml-2">
              {t('diseaseDetection.actions.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : result ? (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-lima-100">
          {/* Disease Name */}
          <View className="mb-4">
            <Text className="text-sm text-lima-600">
              {t('diseaseDetection.results.detected')}
            </Text>
            <Text className="text-xl font-bold text-gray-900 mt-1">
              {result.diseaseName}
            </Text>
          </View>

          {/* Accuracy */}
          <View className="mb-4">
            <Text className="text-sm text-lima-600">
              {t('diseaseDetection.results.accuracy')}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-lima-600 rounded-full"
                  style={{ width: `${result.accuracy}%` }}
                />
              </View>
              <Text className="text-lima-700 font-medium ml-3">
                {result.accuracy.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <View>
              <Text className="text-sm text-lima-600 mb-2">
                {t('diseaseDetection.results.recommendations')}
              </Text>
              {result.recommendations.map((recommendation, index) => (
                <View
                  key={index}
                  className="flex-row items-start bg-lima-50 rounded-lg p-3 mb-2"
                >
                  <MaterialCommunityIcons
                    name="information"
                    size={16}
                    color="#4d7c0f"
                    style={{ marginTop: 2 }}
                  />
                  <Text className="text-lima-700 ml-2 flex-1">
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View className="flex-row mt-6">
            <TouchableOpacity
              onPress={onRetry}
              className="flex-1 bg-lima-100 p-4 rounded-xl flex-row items-center justify-center mr-2"
            >
              <MaterialCommunityIcons name="camera" size={20} color="#4d7c0f" />
              <Text className="text-lima-700 font-medium ml-2">
                {t('diseaseDetection.actions.newScan')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onAnalyze}
          className="bg-lima-600 p-4 rounded-xl flex-row items-center justify-center"
        >
          <MaterialCommunityIcons name="magnify-scan" size={24} color="white" />
          <Text className="text-white font-medium ml-2">
            {t('diseaseDetection.actions.analyze')}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
