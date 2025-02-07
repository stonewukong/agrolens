import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
  ];

  return (
    <View className="bg-white rounded-xl border border-lima-200 overflow-hidden">
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => setLanguage(lang.code as 'en' | 'hi' | 'te')}
          className={`p-3 flex-row items-center justify-between ${
            language === lang.code ? 'bg-lima-100' : 'border-b border-lima-200'
          }`}
        >
          <Text
            className={`${
              language === lang.code ? 'text-lima-800' : 'text-gray-600'
            } font-medium`}
          >
            {lang.name}
          </Text>
          {language === lang.code && (
            <View className="size-2 rounded-full bg-lima-800" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
