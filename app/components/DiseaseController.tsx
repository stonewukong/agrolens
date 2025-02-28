import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DiseaseView from './DiseaseView';

interface DetectionResult {
  diseaseName: string;
  accuracy: number;
  recommendations?: string[];
}

export default function DiseaseController() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('diseaseDetection.permissions.title'),
          t('diseaseDetection.permissions.message')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError(t('diseaseDetection.errors.imagePicker'));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('diseaseDetection.permissions.title'),
          t('diseaseDetection.permissions.camera')
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError(t('diseaseDetection.errors.camera'));
    }
  };

  const detectDisease = async () => {
    if (!image) return;

    try {
      setLoading(true);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      } as any);

      // Replace with your actual API endpoint
      const response = await axios.post(
        'YOUR_API_ENDPOINT/detect-disease',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error('Error detecting disease:', error);
      setError(t('diseaseDetection.errors.detection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          {t('diseaseDetection.title')}
        </Text>
        <Text className="text-sm text-lima-600 mt-1">
          {t('diseaseDetection.description')}
        </Text>
      </View>

      {/* Image Upload Section */}
      {!image ? (
        <View className="flex-1 items-center justify-center">
          <View className="bg-lima-50 p-8 rounded-2xl items-center mb-6">
            <MaterialCommunityIcons
              name="leaf-maple"
              size={64}
              color="#4d7c0f"
            />
            <Text className="text-lima-700 font-medium mt-4 text-center">
              {t('diseaseDetection.upload.title')}
            </Text>
            <Text className="text-lima-600 text-sm mt-2 text-center">
              {t('diseaseDetection.upload.description')}
            </Text>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 bg-lima-100 p-4 rounded-xl flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="camera" size={24} color="#4d7c0f" />
              <Text className="text-lima-700 font-medium ml-2">
                {t('diseaseDetection.actions.camera')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              className="flex-1 bg-lima-600 p-4 rounded-xl flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="image" size={24} color="white" />
              <Text className="text-white font-medium ml-2">
                {t('diseaseDetection.actions.gallery')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <DiseaseView
          image={image}
          result={result}
          loading={loading}
          error={error}
          onRetry={() => setImage(null)}
          onAnalyze={detectDisease}
        />
      )}
    </View>
  );
}
