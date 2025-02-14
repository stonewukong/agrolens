import React, { useState, useRef, useEffect } from 'react';
import 'react-native-get-random-values';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { CropType, SoilType, IrrigationMethod } from '@/app/types/farm';
import { useFarmStore } from '@/app/stores/useFarmStore';
import * as Location from 'expo-location';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

type Step = 'draw' | 'form';

interface MarkerType {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  id: string;
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    area: number;
    agroPolygonId?: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

const translations = {
  insights: {
    title: 'Farm Insights',
    ndvi: 'Vegetation Health Index',
    soilMoisture: 'Soil Moisture',
    soilTemp: 'Soil Temperature',
    temp: 'Current Temperature',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    uv: 'UV Index',
    alerts: 'Weather Alerts',
    error: 'Failed to gather farm insights. Please try again.',
    processing: 'Processing polygon...',
    gathering: 'Gathering insights...',
  },
};

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
    area: 0,
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
  const [markers, setMarkers] = useState<MarkerType[]>([]);
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
    if (!isDrawing) {
      console.log('Not in drawing mode');
      return;
    }

    const newMarker = {
      coordinate: e.nativeEvent.coordinate,
      id: Math.random().toString(),
    };

    console.log('Current markers:', markers);
    console.log('Adding new marker:', newMarker);

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);

    // Update instructions based on remaining points needed
    updateInstructionsText(updatedMarkers.length);

    // If we have 4 points, create the polygon
    if (updatedMarkers.length === 4) {
      console.log('Fourth point added, creating polygon');
      const coordinates = updatedMarkers.map((marker) => [
        marker.coordinate.longitude,
        marker.coordinate.latitude,
      ]);

      // Close the polygon by adding the first point again
      const closedCoordinates = [...coordinates, coordinates[0]];
      console.log('Closed coordinates:', closedCoordinates);

      // Create polygon in AgroMonitoring API
      createPolygon(closedCoordinates);
    }
  };

  const createPolygon = async (coordinates: number[][]) => {
    try {
      setLoading(true);
      const polygonResponse = await agroMonitoringService.createPolygon(
        'Farm Polygon',
        [coordinates]
      );

      // Convert hectares to acres
      const areaInAcres = polygonResponse.area * 2.47105;

      // Create the GeoJSON location object
      const location: GeoJSONFeature = {
        type: 'Feature',
        properties: {
          name: 'Farm Polygon',
          area: areaInAcres,
          agroPolygonId: polygonResponse.id,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      };

      setFarmLocation(location);
      setIsDrawing(false);

      // Show confirmation dialog with polygon details
      Alert.alert(
        'Polygon Created',
        `Area: ${areaInAcres.toFixed(2)} acres\nPolygon ID: ${
          polygonResponse.id
        }`,
        [
          {
            text: 'Continue',
            onPress: () => {
              setStep('form');
              // Pre-fill the area in the form
              setFormData((prev) => ({
                ...prev,
                area: areaInAcres,
              }));
            },
          },
        ]
      );

      return polygonResponse;
    } catch (error) {
      console.error('Error creating polygon:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : 'Failed to create polygon'
      );
      // Reset markers to allow retry
      setMarkers([]);
      updateInstructionsText(0);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add helper function to show area while drawing
  const updateInstructionsText = (markerCount: number) => {
    if (markerCount === 0) {
      return t('map.drawInstructions', { count: 4 });
    } else if (markerCount < 4) {
      return t('map.drawInstructions', { count: 4 - markerCount });
    } else {
      // Calculate area for the current polygon
      const coordinates = markers.map((marker) => ({
        latitude: marker.coordinate.latitude,
        longitude: marker.coordinate.longitude,
      }));
      const areaInAcres = calculateArea(coordinates);

      // Show warning if area is too large (3000 hectares = 7413 acres)
      if (areaInAcres > 7413) {
        return `Selected area: ${areaInAcres.toFixed(
          2
        )} acres\nToo large! Maximum allowed: 7,413 acres`;
      }

      return `Selected area: ${areaInAcres.toFixed(2)} acres`;
    }
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
    if (markers.length < 3) {
      Alert.alert(t('common.error'), t('map.invalidPolygon'));
      return;
    }

    const coordinates = markers.map((marker) => [
      marker.coordinate.longitude,
      marker.coordinate.latitude,
    ]);

    // Close the polygon by adding the first point again
    const closedCoordinates = [...coordinates, coordinates[0]];
    createPolygon(closedCoordinates);
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

      // Create polygon in AgroMonitoring API if not already created
      const polygonId =
        farmLocation.properties.agroPolygonId ||
        (await createPolygon(farmLocation.geometry.coordinates[0])).id;

      if (polygonId) {
        // Add farm to local store
        addFarm({
          name: formData.name,
          type:
            formData.cropType === 'other'
              ? 'Other'
              : ((formData.cropType.charAt(0).toUpperCase() +
                  formData.cropType.slice(1)) as
                  | 'Wheat'
                  | 'Rice'
                  | 'Corn'
                  | 'Other'),
          area: formData.area,
          location: {
            latitude: farmLocation.geometry.coordinates[0][0][1],
            longitude: farmLocation.geometry.coordinates[0][0][0],
            address: 'Custom Location',
          },
          status: 'Healthy',
          growthStage: {
            days: 0,
            stage: 'Seedling',
            expectedHarvestDate: new Date(
              Date.now() + 120 * 24 * 60 * 60 * 1000
            ),
            totalDuration: 120,
          },
          metrics: {
            ndviScore: 0,
            waterStress: {
              level: 'Low',
              value: 0,
            },
            nitrogen: {
              value: 0,
              status: 'Adequate',
            },
            diseaseRisk: {
              percentage: 0,
              status: 'Low',
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
          icon: getCropIcon(formData.cropType),
          notes: [],
          agroPolygonId: polygonId,
        });

        router.back();
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('farms.insights.error'), [
        { text: t('common.ok') },
      ]);
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

          <View className="flex-1">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={getMapRegion()}
              onPress={handleMapPress}
              provider={PROVIDER_DEFAULT}
              mapType={mapType}
            >
              {/* Markers */}
              {markers.map((marker, index) => (
                <Marker key={marker.id} coordinate={marker.coordinate}>
                  <View className="items-center">
                    <View className="bg-lima-600 rounded-full w-8 h-8 items-center justify-center border-2 border-white shadow">
                      <Text className="text-white font-bold text-base">
                        {index + 1}
                      </Text>
                    </View>
                  </View>
                </Marker>
              ))}

              {/* Polyline connecting markers */}
              {markers.length >= 2 && (
                <Polyline
                  coordinates={markers.map((marker) => marker.coordinate)}
                  strokeColor="#4d7c0f"
                  strokeWidth={2}
                />
              )}

              {/* Polygon fill when not in drawing mode */}
              {!isDrawing && markers.length >= 3 && (
                <Polygon
                  coordinates={markers.map((marker) => marker.coordinate)}
                  fillColor="rgba(77, 124, 15, 0.2)"
                  strokeColor="#4d7c0f"
                  strokeWidth={2}
                />
              )}
            </MapView>

            {/* Instructions Banner */}
            <View className="absolute mx-auto bottom-24 left-6 right-6">
              <View className="bg-lima-300 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-lg border border-lima-400">
                <View className="flex-row items-center justify-center space-x-2">
                  {markers.length < 3 ? (
                    <MaterialCommunityIcons
                      name="gesture-tap"
                      size={20}
                      color="#4d7c0f"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="map-marker-radius"
                      size={20}
                      color={
                        calculateArea(coordinates) * 0.4047 > 3000
                          ? '#dc2626'
                          : '#4d7c0f'
                      }
                    />
                  )}
                  <Text
                    className={`text-center text-base ${
                      markers.length >= 3 &&
                      calculateArea(coordinates) * 0.4047 > 3000
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-700 font-medium'
                    }`}
                  >
                    {updateInstructionsText(markers.length)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Action Buttons */}
            <View className="absolute bottom-8 left-6 right-6">
              <View className="flex-row justify-between gap-4">
                {isDrawing ? (
                  <>
                    <TouchableOpacity
                      onPress={cancelDrawing}
                      className="flex-1 flex-row items-center justify-center bg-red-500 py-3 rounded-xl shadow-sm"
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color="white"
                      />
                      <Text className="text-white font-medium ml-2">
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={completeDrawing}
                      className="flex-1 flex-row items-center justify-center bg-lima-600 py-3 rounded-xl shadow-sm"
                      disabled={markers.length < 3}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color="white"
                      />
                      <Text className="text-white font-medium ml-2">
                        {t('common.done')}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={startDrawing}
                    className="flex-1 flex-row items-center justify-center bg-lima-600 py-3 rounded-xl shadow-sm"
                  >
                    <MaterialCommunityIcons
                      name="vector-polygon"
                      size={24}
                      color="white"
                    />
                    <Text className="text-white font-medium ml-2">
                      {t('map.startDrawing')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
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
