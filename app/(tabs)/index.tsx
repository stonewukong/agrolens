import { Link } from 'expo-router';
import { Text, View, Pressable } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center p-4 gap-y-4">
      <Text className="text-3xl font-bold text-lima-500 mb-8">
        Welcome to AgroLens
      </Text>

      <Link href="/profile" asChild>
        <Pressable className="w-64 bg-lima-500 p-4 rounded-lg">
          <Text className="text-white text-center font-semibold text-lg">
            Go to Profile
          </Text>
        </Pressable>
      </Link>

      <Link href="/sign-up" asChild>
        <Pressable className="w-64 bg-lima-500 p-4 rounded-lg">
          <Text className="text-white text-center font-semibold text-lg">
            Sign Up
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
