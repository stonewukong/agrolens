import React, { useState, useRef, useEffect } from 'react';
import 'react-native-get-random-values';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {
  Polygon,
  Marker,
  Polyline,
  MapPressEvent,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import {
  CropType,
  SoilType,
  IrrigationMethod,
  FarmLocation,
} from '@/app/types/farm';
import { useFarmStore } from '@/app/stores/useFarmStore';
import * as Location from 'expo-location';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

type Step = 'draw' | 'form';

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    area: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export default function AddFarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const addFarm = useFarmStore((state) => state.addFarm);
  const mapRef = useRef<MapView>(null);

  // Form and UI state
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cropType: 'rice' as CropType,
    otherCropType: '',
    soilType: 'loamy' as SoilType,
    irrigationMethod: 'drip' as IrrigationMethod,
    plantingDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState<Step>('draw');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  // Map drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [markers, setMarkers] = useState<
    Array<{
      coordinate: { latitude: number; longitude: number };
      id: string;
    }>
  >([]);
  const [farmLocation, setFarmLocation] = useState<GeoJSONFeature | null>(null);

  // Get coordinates for polygon/polyline
  const coordinates = markers.map((m) => ({
    latitude: m.coordinate.latitude,
    longitude: m.coordinate.longitude,
  }));

  // Calculate map region based on coordinates
  const getMapRegion = () => {
    if (coordinates.length === 0) {
      return {
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 20,
        longitudeDelta: 20,
      };
    }

    const lats = coordinates.map((coord) => coord.latitude);
    const lngs = coordinates.map((coord) => coord.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const latDelta = Math.max(...lats) - Math.min(...lats);
    const lngDelta = Math.max(...lngs) - Math.min(...lngs);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta * 1.5, 0.05),
      longitudeDelta: Math.max(lngDelta * 1.5, 0.05),
    };
  };

  // Type guard for Step
  const isFormStep = (s: Step): s is 'form' => s === 'form';

  // Simple area calculation in acres (approximate)
  const calculateArea = (
    coords: { latitude: number; longitude: number }[]
  ): number => {
    if (coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].longitude * coords[j].latitude;
      area -= coords[j].longitude * coords[i].latitude;
    }
    area = Math.abs(area) / 2;

    // Convert to acres (rough approximation)
    return area * 247.105; // 1 square degree ≈ 247.105 acres at the equator
  };

  const handleMapPress = (e: MapPressEvent) => {
    if (!isDrawing) return;

    const newMarker = {
      coordinate: e.nativeEvent.coordinate,
      id: `marker-${Date.now()}-${Math.random()}`,
    };

    setMarkers((prev) => [...prev, newMarker]);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setMarkers([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setMarkers([]);
  };

  const completeDrawing = () => {
    if (coordinates.length < 3) {
      Alert.alert(t('common.error'), t('map.invalidPolygon'));
      return;
    }

    // Close the polygon by adding the first point again
    const closedCoordinates = [
      ...coordinates.map((c) => [c.longitude, c.latitude]),
      [coordinates[0].longitude, coordinates[0].latitude],
    ];

    const location: GeoJSONFeature = {
      type: 'Feature',
      properties: {
        name: '',
        area: calculateArea(coordinates),
      },
      geometry: {
        type: 'Polygon',
        coordinates: [closedCoordinates],
      },
    };

    setFarmLocation(location);
    setIsDrawing(false);
    setStep('form');
  };

  const handleSubmit = async () => {
    try {
      if (!farmLocation) {
        Alert.alert(t('common.error'), 'Please draw farm boundaries first.');
        return;
      }

      if (formData.cropType === 'other' && !formData.otherCropType.trim()) {
        Alert.alert(t('common.error'), t('crops.specifyOtherError'));
        return;
      }

      setLoading(true);

      // Create polygon in AgroMonitoring API
      const polygon = await agroMonitoringService.createPolygon(
        formData.name,
        farmLocation.geometry.coordinates
      );

      // Add farm to local store
      addFarm({
        name: formData.name,
        type:
          formData.cropType === 'other'
            ? ('Other' as const)
            : ((formData.cropType.charAt(0).toUpperCase() +
                formData.cropType.slice(1)) as
                | 'Wheat'
                | 'Rice'
                | 'Corn'
                | 'Other'),
        area: farmLocation.properties.area,
        location: {
          latitude:
            farmLocation.geometry.coordinates[0][
              Math.floor(farmLocation.geometry.coordinates[0].length / 2)
            ][1],
          longitude:
            farmLocation.geometry.coordinates[0][
              Math.floor(farmLocation.geometry.coordinates[0].length / 2)
            ][0],
          address: '', // You might want to add reverse geocoding here
        },
        status: 'Healthy',
        growthStage: {
          days: 0,
          stage: 'Seedling',
          expectedHarvestDate: new Date(
            formData.plantingDate.getTime() + 120 * 24 * 60 * 60 * 1000
          ),
          totalDuration: 120,
        },
        metrics: {
          ndviScore: 0,
          waterStress: { level: 'Low', value: 0 },
          nitrogen: { value: 0, status: 'Adequate' },
          diseaseRisk: { percentage: 0, status: 'Low' },
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
        icon: getCropIcon(formData.cropType),
        notes: [],
        agroPolygonId: polygon.id,
      });

      router.back();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.unknownError')
      );
    } finally {
      setLoading(false);
    }
  };

  const getCropIcon = (
    cropType: CropType
  ): 'grain' | 'sprout' | 'corn' | 'seed' => {
    switch (cropType) {
      case 'wheat':
        return 'grain';
      case 'rice':
        return 'sprout';
      case 'corn':
        return 'corn';
      default:
        return 'seed';
    }
  };

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('weather.error.enableLocation'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest, // Request highest accuracy
      });

      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005, // Much closer zoom (about 500m view)
          longitudeDelta: 0.005,
        },
        1000
      ); // 1 second animation
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('common.error'), t('weather.error.locationUnavailable'));
    } finally {
      setLoadingLocation(false);
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = (location: SearchResult) => {
    mapRef.current?.animateToRegion({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  if (step === 'draw') {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 relative">
          {/* Map Controls Container */}
          <View className="absolute top-12 left-4 right-4 z-20">
            {/* Search Bar and Controls Row */}
            <View className="flex-row gap-2">
              {/* Search Bar */}
              <View className="flex-1">
                <View className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <View className="flex-row items-center px-4">
                    <MaterialCommunityIcons
                      name="magnify"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 h-12 ml-2 text-gray-700"
                      placeholder={t('map.searchPlaceholder')}
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        searchPlaces(text);
                      }}
                    />
                    {searching && (
                      <ActivityIndicator size="small" color="#4d7c0f" />
                    )}
                  </View>
                  {searchResults.length > 0 && (
                    <View className="border-t border-gray-100">
                      <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.display_name}
                        className="max-h-64"
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            className="p-4 border-b border-gray-50 flex-row items-center"
                            onPress={() => handleLocationSelect(item)}
                          >
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={20}
                              color="#4d7c0f"
                            />
                            <Text className="text-gray-700 ml-2 flex-1">
                              {item.display_name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Map Controls Column */}
              <View className="gap-2">
                {/* Map Type Toggle */}
                <TouchableOpacity
                  className="bg-white h-12 w-12 rounded-xl shadow-lg border border-gray-100 items-center justify-center"
                  onPress={() =>
                    setMapType((prev) =>
                      prev === 'standard' ? 'satellite' : 'standard'
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={mapType === 'standard' ? 'satellite-variant' : 'map'}
                    size={24}
                    color="#374151"
                  />
                </TouchableOpacity>

                {/* Location Button */}
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  className="bg-white h-12 w-12 rounded-xl shadow-lg border border-gray-100 items-center justify-center"
                >
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color="#4d7c0f" />
                  ) : (
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={24}
                      color="#4d7c0f"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <MapView
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
            provider={PROVIDER_DEFAULT}
            mapType={Platform.select({ ios: mapType, android: undefined })}
            initialRegion={getMapRegion()}
            region={isFormStep(step) ? getMapRegion() : undefined}
            onPress={handleMapPress}
            scrollEnabled={!isDrawing}
            zoomEnabled={!isDrawing}
            rotateEnabled={!isDrawing}
          >
            {/* Draw markers for each point */}
            {markers.map((marker, index) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                pinColor="#4d7c0f"
                title={`Point ${index + 1}`}
              >
                <View className="items-center">
                  <View className="bg-lima-600 rounded-full p-2 border-2 border-white">
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                </View>
              </Marker>
            ))}

            {/* Draw lines between points */}
            {coordinates.length > 1 && (
              <Polyline
                coordinates={coordinates}
                strokeWidth={2}
                strokeColor="#4d7c0f"
              />
            )}

            {/* Draw the completed polygon if not in drawing mode */}
            {!isDrawing && coordinates.length > 2 && (
              <Polygon
                coordinates={coordinates}
                strokeWidth={2}
                strokeColor="#4d7c0f"
                fillColor="rgba(77, 124, 15, 0.2)"
              />
            )}
          </MapView>

          {/* Drawing controls */}
          {step === 'draw' && (
            <View className="absolute bottom-4 left-4 right-4 flex-row justify-between">
              {isDrawing ? (
                <>
                  <TouchableOpacity
                    className="bg-red-500 rounded-lg px-4 py-2"
                    onPress={cancelDrawing}
                  >
                    <Text className="text-white font-medium">
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-lima-600 rounded-lg px-4 py-2"
                    onPress={completeDrawing}
                    disabled={coordinates.length < 3}
                  >
                    <Text className="text-white font-medium">
                      {t('common.done')}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="bg-lima-600 rounded-lg px-4 py-2 w-full"
                  onPress={startDrawing}
                >
                  <Text className="text-white font-medium text-center">
                    {t('map.startDrawing')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="transparent" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Header */}
        <View className="pb-4">
          {/* Background Pattern */}
          <View
            className="absolute inset-0 opacity-30"
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#65a30d',
              borderStyle: 'dotted',
              borderRadius: 1,
            }}
          />
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#4d7c0f"
                />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {t('farms.addFarm')}
                </Text>
                <Text className="text-sm text-lima-600 mt-1">
                  {t('map.confirmBoundaries')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        {coordinates.length > 0 && (
          <View className="px-6 mb-6">
            <View
              className="rounded-xl overflow-hidden border border-lima-200"
              style={{ height: 200 }}
            >
              <MapView
                provider={PROVIDER_DEFAULT}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude:
                    coordinates[Math.floor(coordinates.length / 2)].latitude,
                  longitude:
                    coordinates[Math.floor(coordinates.length / 2)].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Polygon
                  coordinates={coordinates}
                  fillColor="rgba(101, 163, 13, 0.2)"
                  strokeColor="#65a30d"
                  strokeWidth={2}
                />
              </MapView>
              <View className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-full border border-lima-200">
                <Text className="text-sm text-lima-700">
                  {calculateArea(coordinates).toFixed(2)} {t('farms.acres')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Form Content */}
        <View className="px-6">
          {/* Farm Name */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              {t('farms.farmName')}
            </Text>
            <TextInput
              className="bg-white border border-lima-200 rounded-xl px-4 py-3 text-gray-700"
              placeholder={t('farms.farmNamePlaceholder')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Crop Type */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              {t('farms.cropType')}
            </Text>
            <View className="border border-lima-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.cropType}
                onValueChange={(value) =>
                  setFormData({ ...formData, cropType: value as CropType })
                }
              >
                <Picker.Item label={'🌾 ' + t('crops.rice')} value="rice" />
                <Picker.Item label={'🌾 ' + t('crops.wheat')} value="wheat" />
                <Picker.Item label={'🌽 ' + t('crops.corn')} value="corn" />
                <Picker.Item
                  label={'🌱 ' + t('crops.soybean')}
                  value="soybean"
                />
                <Picker.Item label={'🌿 ' + t('crops.cotton')} value="cotton" />
                <Picker.Item
                  label={'🎋 ' + t('crops.sugarcane')}
                  value="sugarcane"
                />
                <Picker.Item label={'🌱 ' + t('crops.other')} value="other" />
              </Picker>
            </View>
          </View>

          {/* Other Crop Type Input */}
          {formData.cropType === 'other' && (
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                {t('crops.specifyOther')}
              </Text>
              <TextInput
                className="bg-white border border-lima-200 rounded-xl px-4 py-3 text-gray-700"
                placeholder={t('crops.otherPlaceholder')}
                value={formData.otherCropType}
                onChangeText={(text) =>
                  setFormData({ ...formData, otherCropType: text })
                }
              />
            </View>
          )}

          {/* Soil Type */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              {t('farms.soilType')}
            </Text>
            <View className="border border-lima-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.soilType}
                onValueChange={(value) =>
                  setFormData({ ...formData, soilType: value as SoilType })
                }
              >
                <Picker.Item label={t('soil.clay')} value="clay" />
                <Picker.Item label={t('soil.sandy')} value="sandy" />
                <Picker.Item label={t('soil.loamy')} value="loamy" />
                <Picker.Item label={t('soil.silty')} value="silty" />
                <Picker.Item label={t('soil.peaty')} value="peaty" />
                <Picker.Item label={t('soil.chalky')} value="chalky" />
              </Picker>
            </View>
          </View>

          {/* Irrigation Method */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              {t('farms.irrigationMethod')}
            </Text>
            <View className="border border-lima-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.irrigationMethod}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    irrigationMethod: value as IrrigationMethod,
                  })
                }
              >
                <Picker.Item label={t('irrigation.drip')} value="drip" />
                <Picker.Item
                  label={t('irrigation.sprinkler')}
                  value="sprinkler"
                />
                <Picker.Item label={t('irrigation.flood')} value="flood" />
                <Picker.Item
                  label={t('irrigation.centerPivot')}
                  value="centerPivot"
                />
              </Picker>
            </View>
          </View>

          {/* Planting Date */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              {t('farms.plantingDate')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white border border-lima-200 rounded-xl px-4 py-3"
            >
              <Text className="text-gray-700">
                {formData.plantingDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.plantingDate}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setFormData({ ...formData, plantingDate: date });
                }
              }}
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-xl py-4 px-6 mb-6 flex-row items-center justify-center ${
              loading ? 'bg-lima-300' : 'bg-lima-600'
            }`}
          >
            {loading ? (
              <MaterialCommunityIcons
                name="loading"
                size={24}
                color="white"
                className="animate-spin"
              />
            ) : (
              <MaterialCommunityIcons name="check" size={24} color="white" />
            )}
            <Text className="text-white font-semibold text-lg ml-2">
              {t('common.done')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
