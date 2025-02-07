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
          backgroundColor: '#4d7c0f', // Changed to lima-700
          borderTopWidth: 1,
          borderTopColor: '#84cc16', // Changed to lima-500
          elevation: 0,
          height: 65 + insets.bottom,
          paddingTop: 14,
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          marginTop: -10,
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#ffffff', // Keep white for active
        tabBarInactiveTintColor: '#d9f99d', // Keep lima-200 for inactive
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1 rounded-2xl ${
                focused ? 'bg-white/20' : 'bg-transparent'
              }`}
            >
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={focused ? '#ffffff' : '#d9f99d'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'My Farms',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1 rounded-2xl ${
                focused ? 'bg-white/20' : 'bg-transparent'
              }`}
            >
              <MaterialCommunityIcons
                name="sprout"
                size={24}
                color={focused ? '#ffffff' : '#d9f99d'}
              />
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
              <View
                className={`p-1 rounded-2xl ${
                  focused ? 'bg-white/20' : 'bg-transparent'
                }`}
              >
                <MaterialCommunityIcons
                  name="bell"
                  size={24}
                  color={focused ? '#ffffff' : '#d9f99d'}
                />
              </View>
              <View className="absolute -top-0.5 right-0.5 size-2.5 bg-red-500 rounded-full border-2 border-lima-700" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-1 rounded-2xl ${
                focused ? 'bg-white/20' : 'bg-transparent'
              }`}
            >
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={focused ? '#ffffff' : '#d9f99d'}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
