import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

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
          onPress={() => i18n.changeLanguage(lang.code)}
          className={`p-3 flex-row items-center justify-between ${
            i18n.language === lang.code
              ? 'bg-lima-100'
              : 'border-b border-lima-200'
          }`}
        >
          <Text
            className={`${
              i18n.language === lang.code ? 'text-lima-800' : 'text-gray-600'
            } font-medium`}
          >
            {lang.name}
          </Text>
          {i18n.language === lang.code && (
            <View className="size-2 rounded-full bg-lima-800" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
