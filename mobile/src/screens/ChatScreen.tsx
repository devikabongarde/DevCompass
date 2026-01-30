import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { messageService, profileService, hackathonService } from '../services/supabase';
import { theme } from '../theme';
import { Message, Profile } from '../types';

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, teamId } = route.params as { userId?: string; teamId?: string };
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (userId) {
        const profile = await profileService.getProfile(userId);
        setOtherUser(profile);
        const msgs = await messageService.getMessages(userId);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      const message = await messageService.sendMessage(userId, newMessage.trim(), teamId);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.from_user_id === user?.id;
    const isHackathonShare = item.message_type === 'hackathon_share';
    
    // Extract hackathon ID from content
    const hackathonIdMatch = item.content.match(/\[HACKATHON:([^\]]+)\]/);
    const hackathonId = hackathonIdMatch ? hackathonIdMatch[1] : null;
    const displayContent = item.content.replace(/\[HACKATHON:[^\]]+\]/, '').trim();
    
    const handleHackathonPress = async () => {
      if (hackathonId) {
        try {
          const hackathon = await hackathonService.getHackathon(hackathonId);
          navigation.navigate('HackathonDetail' as never, { hackathon } as never);
        } catch (error) {
          console.error('Error loading hackathon:', error);
        }
      }
    };
    
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 16,
      }}>
        <TouchableOpacity
          style={{
            maxWidth: '80%',
            backgroundColor: isHackathonShare
              ? (isDarkMode ? '#1e40af' : '#3b82f6')
              : isMe 
              ? theme.colors.primary 
              : (isDarkMode ? '#334155' : '#F1F5F9'),
            borderRadius: 16,
            padding: 12,
            borderBottomRightRadius: isMe ? 4 : 16,
            borderBottomLeftRadius: isMe ? 16 : 4,
            borderWidth: isHackathonShare ? 1 : 0,
            borderColor: isHackathonShare ? (isDarkMode ? '#3b82f6' : '#1d4ed8') : 'transparent',
          }}
          onPress={isHackathonShare ? handleHackathonPress : undefined}
          disabled={!isHackathonShare}
        >
          {isHackathonShare && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons name="trophy" size={16} color="white" />
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                marginLeft: 4,
              }}>
                HACKATHON
              </Text>
            </View>
          )}
          
          <Text style={{
            color: isHackathonShare ? 'white' : isMe ? 'white' : (isDarkMode ? '#f8fafc' : '#0F172A'),
            fontSize: 16,
          }}>
            {displayContent}
          </Text>
          
          {isHackathonShare && (
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 12,
              marginTop: 4,
              fontStyle: 'italic',
            }}>
              Tap to view details
            </Text>
          )}
          
          <Text style={{
            color: isHackathonShare ? 'rgba(255,255,255,0.7)' : isMe ? 'rgba(255,255,255,0.7)' : (isDarkMode ? '#94a3b8' : '#64748B'),
            fontSize: 12,
            marginTop: 4,
          }}>
            {new Date(item.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
    }}>
      {/* Header */}
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
        
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 16,
          marginRight: 12,
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {otherUser?.full_name?.charAt(0) || 'U'}
          </Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
          }}>
            {otherUser?.full_name || 'Loading...'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: isDarkMode ? '#94a3b8' : '#64748B',
          }}>
            @{otherUser?.username}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
            <Text style={{
              fontSize: 16,
              color: isDarkMode ? '#94a3b8' : '#64748B',
              textAlign: 'center',
              marginTop: 12,
            }}>
              Start the conversation!
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#334155' : '#E5E7EB',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: isDarkMode ? '#475569' : '#E2E8F0',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 16,
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
              marginRight: 12,
            }}
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: newMessage.trim() ? 1 : 0.5,
            }}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};