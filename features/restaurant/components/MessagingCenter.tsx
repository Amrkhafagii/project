import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle, ArrowLeft, Send, Phone, MoveVertical as MoreVertical, Clock, CheckCheck, Filter, Star, Users, Truck } from 'lucide-react-native';
import { messagingService } from '@/services/messaging/messagingService';

interface MessagingCenterProps {
  restaurantId: string;
}

export function MessagingCenter({ restaurantId }: MessagingCenterProps) {
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentThread, setCurrentThread] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'customer_support' | 'driver_coordination'>('all');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadConversations();
    
    // Subscribe to real-time updates
    const unsubscribeMessage = messagingService.subscribe('message_sent', (data) => {
      if (data.conversation.id === selectedConversationId) {
        loadCurrentThread();
      }
      loadConversations();
    });

    const unsubscribeTyping = messagingService.subscribe('typing_updated', (data) => {
      if (data.conversationId === selectedConversationId) {
        setIsTyping(data.isTyping.length > 0);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [selectedConversationId]);

  const loadConversations = () => {
    const allConversations = messagingService.getConversations(restaurantId);
    setConversations(allConversations);
  };

  const loadCurrentThread = () => {
    if (selectedConversationId) {
      const thread = messagingService.getConversationThread(selectedConversationId);
      setCurrentThread(thread);
    }
  };

  const openConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentView('chat');
    loadCurrentThread();
    
    // Mark messages as read
    messagingService.markAsRead(conversationId, restaurantId);
  };

  const closeConversation = () => {
    setCurrentView('list');
    setSelectedConversationId(null);
    setCurrentThread(null);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      await messagingService.sendMessage(
        selectedConversationId,
        restaurantId,
        'restaurant',
        newMessage.trim()
      );
      setNewMessage('');
      loadCurrentThread();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (selectedConversationId) {
      messagingService.setTyping(selectedConversationId, restaurantId, 'Restaurant', true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        messagingService.setTyping(selectedConversationId, restaurantId, 'Restaurant', false);
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || (conv.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || conv.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'customer_support':
        return <Users size={20} color="#3B82F6" />;
      case 'driver_coordination':
        return <Truck size={20} color="#10B981" />;
      default:
        return <MessageCircle size={20} color="#6B7280" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.conversationItem} 
      onPress={() => openConversation(item.id)}
    >
      <View style={styles.conversationLeft}>
        <View style={styles.avatarContainer}>
          {getConversationIcon(item.type)}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>
              {item.participants.find((p: any) => p.type !== 'restaurant')?.name || 'Unknown'}
            </Text>
            <Text style={styles.conversationTime}>
              {item.lastMessage ? formatDate(item.lastMessage.timestamp) : ''}
            </Text>
          </View>
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          {item.metadata?.priority && (
            <View style={[
              styles.priorityBadge,
              { backgroundColor: item.metadata.priority === 'urgent' ? '#EF4444' : '#F59E0B' }
            ]}>
              <Text style={styles.priorityText}>{item.metadata.priority.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: any }) => {
    const isOwn = item.senderType === 'restaurant';
    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.content}
          </Text>
          {item.metadata?.quickReplyOptions && (
            <View style={styles.quickReplies}>
              {item.metadata.quickReplyOptions.map((option: string, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quickReplyButton}
                  onPress={() => setNewMessage(option)}
                >
                  <Text style={styles.quickReplyText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {formatTime(item.timestamp)}
          </Text>
          {isOwn && (
            <View style={styles.messageStatus}>
              {item.status === 'read' && <CheckCheck size={12} color="#10B981" />}
              {item.status === 'delivered' && <CheckCheck size={12} color="#6B7280" />}
              {item.status === 'sent' && <Clock size={12} color="#6B7280" />}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (currentView === 'chat' && currentThread) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={closeConversation} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.chatHeaderContent}>
            <Text style={styles.chatHeaderName}>
              {currentThread.conversation.participants.find((p: any) => p.type !== 'restaurant')?.name}
            </Text>
            <Text style={styles.chatHeaderStatus}>
              {currentThread.conversation.type.replace('_', ' ')}
              {currentThread.conversation.metadata?.orderId && 
                ` • Order ${currentThread.conversation.metadata.orderId}`
              }
            </Text>
          </View>
          <View style={styles.chatHeaderActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Phone size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={currentThread.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Customer is typing...</Text>
          </View>
        )}

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              multiline
              maxLength={1000}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={newMessage.trim() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'customer_support', label: 'Customer Support' },
          { key: 'driver_coordination', label: 'Driver Coordination' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              filterType === filter.key && styles.filterTabActive,
            ]}
            onPress={() => setFilterType(filter.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === filter.key && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No conversations</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? 'No conversations match your search'
              : 'New conversations will appear here'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  filterTabActive: {
    backgroundColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  conversationsList: {
    paddingBottom: 20,
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Chat styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderContent: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: '#10B981',
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#111827',
  },
  quickReplies: {
    marginTop: 8,
    gap: 6,
  },
  quickReplyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickReplyText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  typingText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#10B981',
  },
});
