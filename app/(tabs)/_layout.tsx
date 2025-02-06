import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarActiveTintColor: '#65a30d',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-1 rounded-xl ${focused ? 'bg-lima-50' : ''}`}>
              <MaterialCommunityIcons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'My Farms',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-1 rounded-xl ${focused ? 'bg-lima-50' : ''}`}>
              <MaterialCommunityIcons name="sprout" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <View className="relative">
              <View className={`p-1 rounded-xl ${focused ? 'bg-lima-50' : ''}`}>
                <MaterialCommunityIcons name="bell" size={24} color={color} />
              </View>
              <View className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-1 rounded-xl ${focused ? 'bg-lima-50' : ''}`}>
              <MaterialCommunityIcons name="account" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
