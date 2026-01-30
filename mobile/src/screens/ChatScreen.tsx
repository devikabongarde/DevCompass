import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ActionSheetIOS,
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'View Profile'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // View Profile
            if (userId) {
              navigation.navigate('UserProfile' as never, { userId } as never);
            }
          }
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        'Options',
        '',
        [
          {
            text: 'View Profile',
            onPress: () => {
              if (userId) {
                navigation.navigate('UserProfile' as never, { userId } as never);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const confirmDeleteChat = () => {
    // Placeholder - delete functionality removed
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (teamId) {
        // Team chat - fetch team name and messages
        setOtherUser({ full_name: 'Team Chat', username: '', id: teamId } as any);
        const msgs = await messageService.getMessages('', teamId);
        setMessages(msgs);
      } else if (userId) {
        // Individual chat
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
    if (!newMessage.trim()) return;
    if (!userId && !teamId) return;

    try {
      const message = await messageService.sendMessage(userId || '', newMessage.trim(), teamId);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await messageService.deleteMessage(messageId);
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.from_user_id === user?.id;
    
    // Extract hackathon ID from content
    const hackathonIdMatch = item.content.match(/\[HACKATHON:([^\]]+)\]/);
    const hackathonId = hackathonIdMatch ? hackathonIdMatch[1] : null;
    const isHackathonShare = !!hackathonId;
    let displayContent = item.content.replace(/\[HACKATHON:[^\]]+\]/, '').trim();
    
    // Extract URL from content
    const urlMatch = displayContent.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : null;
    
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
    
    const handleUrlPress = async () => {
      if (url) {
        try {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Cannot open this URL');
          }
        } catch (error) {
          console.error('Error opening URL:', error);
          Alert.alert('Error', 'Failed to open link');
        }
      }
    };
    
    // Split content into text and URL parts
    const renderContent = () => {
      if (!url) {
        return (
          <Text style={{
            color: isHackathonShare ? 'white' : isMe ? 'white' : (isDarkMode ? '#f8fafc' : '#0F172A'),
            fontSize: 16,
          }}>
            {displayContent}
          </Text>
        );
      }
      
      const parts = displayContent.split(url);
      return (
        <View>
          <Text style={{
            color: isHackathonShare ? 'white' : isMe ? 'white' : (isDarkMode ? '#f8fafc' : '#0F172A'),
            fontSize: 16,
          }}>
            {parts[0]}
          </Text>
          <TouchableOpacity onPress={handleUrlPress}>
            <Text style={{
              color: '#60a5fa',
              fontSize: 16,
              textDecorationLine: 'underline',
              marginTop: 4,
            }}>
              {url}
            </Text>
          </TouchableOpacity>
          {parts[1] && (
            <Text style={{
              color: isHackathonShare ? 'white' : isMe ? 'white' : (isDarkMode ? '#f8fafc' : '#0F172A'),
              fontSize: 16,
            }}>
              {parts[1]}
            </Text>
          )}
        </View>
      );
    };
    
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
        onLongPress={() => {
          if (isMe) {
            handleDeleteMessage(item.id);
          }
        }}
      >
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
          activeOpacity={0.7}
          onPress={() => {
            if (isHackathonShare) {
              handleHackathonPress();
            }
          }}
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
          
          {renderContent()}
          
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

        <TouchableOpacity onPress={showMenu} style={{ padding: 8 }}>
          <Ionicons name="ellipsis-vertical" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || `message-${index}-${item.created_at}`}
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