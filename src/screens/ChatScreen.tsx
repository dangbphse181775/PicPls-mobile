import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as signalR from '@microsoft/signalr';

import messageApi from '../api/messageApi';
import type { MessageResponse } from '../types/message.types';
import type { RootStackParamList } from '../../App';
import { useAuthStore } from '../store/authStore';

// URL API cần trỏ đúng về backend. VD: axiosClient.defaults.baseURL
import axiosClient from '../api/axiosClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: Props) {
  const { otherUserId, otherUserName } = route.params;
  const { user, token } = useAuthStore();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Lấy lịch sử chat
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await messageApi.getChatHistory(otherUserId);
        setMessages(history);
      } catch (error) {
        console.error('Lỗi tải lịch sử chat', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [otherUserId]);

  // Thiết lập SignalR
  useEffect(() => {
    if (!token) return;

    // Lấy baseURL từ axiosClient hoặc config cứng tạm thời
    const baseURL = axiosClient.defaults.baseURL || 'http://10.0.2.2:5274';

    let connection: signalR.HubConnection | null = null;
    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseURL}/chathub`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (ctx) => {
            // Exponential backoff: 0, 2s, 5s, 10s, 30s, tối đa 30s
            const delays = [0, 2000, 5000, 10000, 30000];
            return delays[ctx.previousRetryCount] ?? 30000;
          },
        })
        .configureLogging(signalR.LogLevel.Warning) // Giảm noise, chỉ log Warning trở lên
        .build();

      connectionRef.current = connection;

      connection.on('ReceiveMessage', (message: MessageResponse) => {
        // Chỉ nhận tin nhắn nếu cuộc hội thoại đúng (người gửi là otherUserId)
        // hoặc nếu tin nhắn này là do chính mình gửi từ một thiết bị khác
        if (
          message.senderId === otherUserId ||
          message.receiverId === otherUserId
        ) {
          setMessages((prev) => {
            // Deduplicate by content and time (if ID is not reliable yet)
            // Or just check if we already have it
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      });

      // Reconnect callbacks - không crash app khi server close connection
      connection.onreconnecting(() => {
        // Đang reconnect: im lặng, không log warning
      });
      connection.onreconnected(() => {
        // Reconnect thành công
      });
      connection.onclose((err) => {
        // Server đóng connection: chỉ log nếu là lỗi thật, không phải do user navigate
        // (Đóng modal Chat khi leave sẽ trigger onclose với err=undefined)
        if (err) {
          console.warn('[Chat] SignalR closed (sẽ tự reconnect khi mở lại):', err.message);
        }
        connectionRef.current = null;
      });

      connection
        .start()
        .catch((err) => {
          // Lỗi connect lần đầu: chỉ warn, app vẫn chạy bình thường
          // (chat vẫn gửi được qua API fallback)
          console.warn('[Chat] SignalR initial connect failed:', err?.message || err);
        });
    } catch (err: any) {
      console.warn('[Chat] SignalR init failed:', err?.message || err);
      connectionRef.current = null;
    }

    return () => {
      try {
        // stop() async, fire-and-forget. Lỗi khi stop là bình thường
        // (do React unmount khi connection đang bận)
        connection?.stop()?.catch(() => {});
      } catch {
        // ignore
      }
      connectionRef.current = null;
    };
  }, [token, otherUserId]);

  const handleSend = async () => {
    if (!inputText.trim() || !connectionRef.current) {
      // Không có connection: thông báo nhẹ cho user
      if (inputText.trim()) {
        Alert.alert(
          'Mất kết nối',
          'Không thể gửi tin nhắn lúc này. Vui lòng đợi vài giây để kết nối lại rồi thử lại.',
          [{ text: 'Đã hiểu' }],
        );
      }
      return;
    }

    const content = inputText.trim();
    setInputText('');



    try {
      const conn = connectionRef.current;
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        try {
          // Thử gọi với object payload
          await conn.invoke('SendMessage', {
            receiverId: otherUserId,
            content: content,
          });
        } catch (err) {
          // Nếu backend expect (string, string) thì fallback
          await conn.invoke('SendMessage', otherUserId, content);
        }
      } else {
        // Đang reconnect: hoàn lại input và thông báo
        setInputText(content);
        Alert.alert(
          'Đang kết nối lại',
          'Mất kết nối chat. Tin nhắn của bạn được giữ lại, vui lòng thử gửi lại sau vài giây.',
          [{ text: 'Đã hiểu' }],
        );
      }
    } catch (error: any) {
      // Hoàn lại input nếu gửi lỗi
      setInputText(content);
      console.warn('[Chat] Send message failed:', error?.message || error);
    }
  };

  const renderItem = ({ item }: { item: MessageResponse }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{otherUserName}</Text>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#6B7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#6366F1',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D4E',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },

  listContent: { padding: 16, gap: 12 },
  
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextMe: { color: '#FFF' },
  messageTextThem: { color: COLORS.textPrimary },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendIcon: { color: '#FFF', fontSize: 18, marginLeft: 2 },
});
