import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores';
import { theme } from '../theme';

export const QuickNavButtons: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      margin: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
    }}>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 12,
          backgroundColor: '#EEF2FF',
          borderRadius: 8,
          flex: 1,
          marginRight: 8,
        }}
        onPress={() => navigation.navigate('UserProfile' as never, { userId: user?.id } as never)}
      >
        <Ionicons name="person" size={24} color={theme.colors.primary} />
        <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 4 }}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 12,
          backgroundColor: '#EEF2FF',
          borderRadius: 8,
          flex: 1,
          marginHorizontal: 4,
        }}
        onPress={() => Alert.alert('Messages', 'Start chatting by finding teammates!')}
      >
        <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />
        <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 4 }}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 12,
          backgroundColor: '#EEF2FF',
          borderRadius: 8,
          flex: 1,
          marginLeft: 8,
        }}
        onPress={() => {
          // Navigate to a hackathon and show teammates
          Alert.alert('Find Teammates', 'Swipe right on any hackathon to find teammates!');
        }}
      >
        <Ionicons name="people" size={24} color={theme.colors.primary} />
        <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 4 }}>Teams</Text>
      </TouchableOpacity>
    </View>
  );
};