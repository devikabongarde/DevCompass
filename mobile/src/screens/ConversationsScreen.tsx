import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { messageService } from '../services/supabase';
import { theme } from '../theme';

export const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false } = useThemeStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('ChatScreen' as never, { userId: item.userId } as never)}
    >
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
          {item.profile?.full_name?.charAt(0) || 'U'}
        </Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginBottom: 4,
        }}>
          {item.profile?.full_name || 'Unknown User'}
        </Text>
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
        }} numberOfLines={1}>
          {item.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
    }}>
      <View style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginLeft: 16,
        }}>
          Messages
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.userId}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
              <Text style={{
                fontSize: 16,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                textAlign: 'center',
                marginTop: 12,
              }}>
                No conversations yet{'\n'}Send team invites to start chatting!
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};