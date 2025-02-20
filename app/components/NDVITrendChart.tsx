import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { useTranslation } from 'react-i18next';

type TimeRange = '1m' | '3m' | '6m' | '1y';

interface NDVITrendChartProps {
  polygonId: string;
  onError?: (error: string) => void;
}

interface NDVIDataPoint {
  date: Date;
  value: number;
}

export default function NDVITrendChart({
  polygonId,
  onError,
}: NDVITrendChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3m');
  const [ndviData, setNdviData] = useState<NDVIDataPoint[]>([]);
  const [historicalData, setHistoricalData] = useState<{
    [year: string]: NDVIDataPoint[];
  }>({});
  const { t } = useTranslation();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1m', label: t('farms.ndviChart.oneMonth') },
    { value: '3m', label: t('farms.ndviChart.threeMonths') },
    { value: '6m', label: t('farms.ndviChart.sixMonths') },
    { value: '1y', label: t('farms.ndviChart.oneYear') },
  ];

  const getTimeRange = (range: TimeRange) => {
    const now = new Date();
    const start = new Date();
    switch (range) {
      case '1m':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return {
      start: Math.floor(start.getTime() / 1000),
      end: Math.floor(now.getTime() / 1000),
    };
  };

  const fetchNDVIData = async (range: TimeRange) => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getTimeRange(range);
      const data = await agroMonitoringService.getVegetationIndex(
        polygonId,
        start,
        end
      );

      // Process current period data
      const processedData = data.map((item) => ({
        date: new Date(item.dt * 1000),
        value: item.data.mean,
      }));
      setNdviData(processedData);

      // Fetch and process historical data for comparison
      if (range === '1y') {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const historicalStart = Math.floor(lastYear.getTime() / 1000);
        const historicalEnd = Math.floor(new Date().getTime() / 1000);

        const historicalData = await agroMonitoringService.getVegetationIndex(
          polygonId,
          historicalStart,
          historicalEnd
        );

        // Group data by year
        const groupedData: { [year: string]: NDVIDataPoint[] } = {};
        historicalData.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const year = date.getFullYear().toString();
          if (!groupedData[year]) {
            groupedData[year] = [];
          }
          groupedData[year].push({
            date,
            value: item.data.mean,
          });
        });
        setHistoricalData(groupedData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch NDVI data';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNDVIData(selectedRange);
  }, [selectedRange, polygonId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#4d7c0f" />
          <Text className="text-lima-600 mt-2">
            {t('farms.ndviChart.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#dc2626"
          />
          <Text className="text-red-600 mt-2 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchNDVIData(selectedRange)}
            className="mt-4 bg-lima-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#4d7c0f" />
            <Text className="text-lima-700 ml-2">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-900">
          {t('farms.ndviChart.title')}
        </Text>
        <Text className="text-sm text-lima-600">
          {t('farms.ndviChart.description')}
        </Text>
      </View>

      {/* Time Range Selector */}
      <View className="flex-row mb-4">
        {timeRanges.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setSelectedRange(value)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedRange === value ? 'bg-lima-600' : 'bg-lima-100'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedRange === value ? 'text-white' : 'text-lima-700'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {ndviData.length > 0 ? (
        <View>
          <LineChart
            data={{
              labels: ndviData.map((point) => formatDate(point.date)),
              datasets: [
                {
                  data: ndviData.map((point) => point.value),
                  color: (opacity = 1) => `rgba(77, 124, 15, ${opacity})`,
                  strokeWidth: 2,
                },
                // Add historical data if available
                ...Object.entries(historicalData).map(([year, data]) => ({
                  data: data.map((point) => point.value),
                  color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                  strokeWidth: 1,
                })),
              ],
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(77, 124, 15, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#4d7c0f',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />

          {/* Legend */}
          <View className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text className="text-sm font-medium text-gray-900 mb-2">
              {t('farms.ndviChart.legend')}
            </Text>
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-0.5 bg-lima-600 mr-2" />
              <Text className="text-sm text-gray-600">
                {t('farms.ndviChart.currentPeriod')}
              </Text>
            </View>
            {Object.keys(historicalData).length > 0 && (
              <View className="flex-row items-center">
                <View className="w-4 h-0.5 bg-gray-400 mr-2" />
                <Text className="text-sm text-gray-600">
                  {t('farms.ndviChart.historicalData')}
                </Text>
              </View>
            )}
          </View>

          {/* Analysis */}
          <View className="mt-4">
            <Text className="text-sm text-gray-600">
              {t('farms.ndviChart.analysis', {
                current: ndviData[ndviData.length - 1]?.value.toFixed(2),
                average: (
                  ndviData.reduce((sum, point) => sum + point.value, 0) /
                  ndviData.length
                ).toFixed(2),
              })}
            </Text>
          </View>
        </View>
      ) : (
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons name="chart-line" size={48} color="#9ca3af" />
          <Text className="text-gray-500 mt-2">
            {t('farms.ndviChart.noData')}
          </Text>
        </View>
      )}
    </View>
  );
}
