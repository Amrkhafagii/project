interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'restaurant' | 'driver';
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'order_update' | 'location' | 'quick_reply';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    orderId?: string;
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    location?: { latitude: number; longitude: number };
    quickReplyOptions?: string[];
  };
  isSystemMessage?: boolean;
}

interface Conversation {
  id: string;
  type: 'customer_support' | 'driver_coordination' | 'order_specific';
  participants: Array<{
    id: string;
    type: 'customer' | 'restaurant' | 'driver';
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ConversationThread {
  conversation: Conversation;
  messages: Message[];
  isTyping: Array<{
    userId: string;
    userName: string;
    timestamp: string;
  }>;
}

interface MessageTemplate {
  id: string;
  category: 'greeting' | 'order_status' | 'delivery_issue' | 'complaint_resolution' | 'driver_instructions';
  title: string;
  content: string;
  quickReplies?: string[];
  isActive: boolean;
}

export class MessagingService {
  private conversations: Map<string, ConversationThread> = new Map();
  private templates: MessageTemplate[] = [];
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeMockConversations();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'greeting_1',
        category: 'greeting',
        title: 'Welcome Message',
        content: 'Hi! Thanks for contacting us. How can we help you today?',
        quickReplies: ['Order Status', 'Menu Questions', 'Delivery Issue', 'Other'],
        isActive: true,
      },
      {
        id: 'order_delay',
        category: 'order_status',
        title: 'Order Delay Notification',
        content: 'We apologize for the delay with your order. We\'re working to get it ready as soon as possible. Expected time: [TIME]',
        isActive: true,
      },
      {
        id: 'order_ready',
        category: 'order_status',
        title: 'Order Ready',
        content: 'Great news! Your order is ready and our driver is on the way to pick it up.',
        isActive: true,
      },
      {
        id: 'delivery_issue',
        category: 'delivery_issue',
        title: 'Delivery Issue Response',
        content: 'I understand there\'s an issue with your delivery. Let me check on this for you right away.',
        quickReplies: ['Contact Driver', 'Check Order Status', 'Request Refund'],
        isActive: true,
      },
      {
        id: 'driver_pickup',
        category: 'driver_instructions',
        title: 'Pickup Ready',
        content: 'Order [ORDER_NUMBER] is ready for pickup. Please arrive within the next 10 minutes.',
        isActive: true,
      },
      {
        id: 'driver_special_instructions',
        category: 'driver_instructions',
        title: 'Special Delivery Instructions',
        content: 'This order has special delivery requirements. Please check the delivery notes carefully.',
        isActive: true,
      },
    ];
  }

  private initializeMockConversations() {
    const mockConversations: ConversationThread[] = [
      {
        conversation: {
          id: 'conv_1',
          type: 'customer_support',
          participants: [
            {
              id: 'customer_1',
              type: 'customer',
              name: 'Sarah Johnson',
              isOnline: true,
            },
            {
              id: 'restaurant_1',
              type: 'restaurant',
              name: 'Green Bowl Kitchen',
              isOnline: true,
            },
          ],
          unreadCount: 2,
          isActive: true,
          metadata: {
            orderId: 'order_123',
            orderNumber: '#1234',
            priority: 'medium',
            tags: ['delivery_issue'],
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 300000).toISOString(),
        },
        messages: [
          {
            id: 'msg_1',
            conversationId: 'conv_1',
            senderId: 'customer_1',
            senderType: 'customer',
            senderName: 'Sarah Johnson',
            content: 'Hi, I ordered 30 minutes ago but haven\'t received any updates. Can you check on my order?',
            messageType: 'text',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            status: 'read',
            metadata: { orderId: 'order_123' },
          },
          {
            id: 'msg_2',
            conversationId: 'conv_1',
            senderId: 'restaurant_1',
            senderType: 'restaurant',
            senderName: 'Green Bowl Kitchen',
            content: 'Hi Sarah! I apologize for the delay. Let me check on your order right away.',
            messageType: 'text',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            status: 'read',
          },
          {
            id: 'msg_3',
            conversationId: 'conv_1',
            senderId: 'restaurant_1',
            senderType: 'restaurant',
            senderName: 'Green Bowl Kitchen',
            content: 'Your order is currently being prepared and should be ready in about 10 minutes. Our driver will pick it up shortly after.',
            messageType: 'text',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'delivered',
          },
        ],
        isTyping: [],
      },
      {
        conversation: {
          id: 'conv_2',
          type: 'driver_coordination',
          participants: [
            {
              id: 'driver_1',
              type: 'driver',
              name: 'Alex Martinez',
              isOnline: true,
              lastSeen: new Date(Date.now() - 120000).toISOString(),
            },
            {
              id: 'restaurant_1',
              type: 'restaurant',
              name: 'Green Bowl Kitchen',
              isOnline: true,
            },
          ],
          unreadCount: 0,
          isActive: true,
          metadata: {
            priority: 'high',
            tags: ['urgent_pickup'],
          },
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 120000).toISOString(),
        },
        messages: [
          {
            id: 'msg_4',
            conversationId: 'conv_2',
            senderId: 'restaurant_1',
            senderType: 'restaurant',
            senderName: 'Green Bowl Kitchen',
            content: 'Order #1235 is ready for pickup. Customer is waiting.',
            messageType: 'text',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            status: 'read',
            metadata: { orderId: 'order_125' },
          },
          {
            id: 'msg_5',
            conversationId: 'conv_2',
            senderId: 'driver_1',
            senderType: 'driver',
            senderName: 'Alex Martinez',
            content: 'On my way! ETA 5 minutes.',
            messageType: 'text',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'read',
          },
          {
            id: 'msg_6',
            conversationId: 'conv_2',
            senderId: 'driver_1',
            senderType: 'driver',
            senderName: 'Alex Martinez',
            content: 'Arrived at restaurant',
            messageType: 'location',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            status: 'read',
            metadata: {
              location: { latitude: 40.7128, longitude: -74.0060 },
            },
          },
        ],
        isTyping: [],
      },
    ];

    mockConversations.forEach(thread => {
      // Set last message
      const lastMessage = thread.messages[thread.messages.length - 1];
      thread.conversation.lastMessage = lastMessage;
      
      this.conversations.set(thread.conversation.id, thread);
    });
  }

  // Public API Methods

  /**
   * Get all conversations for a restaurant
   */
  getConversations(restaurantId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .map(thread => thread.conversation)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get a specific conversation thread
   */
  getConversationThread(conversationId: string): ConversationThread | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'restaurant' | 'customer' | 'driver',
    content: string,
    messageType: Message['messageType'] = 'text',
    metadata?: Message['metadata']
  ): Promise<Message> {
    const thread = this.conversations.get(conversationId);
    if (!thread) {
      throw new Error('Conversation not found');
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId,
      senderType,
      senderName: this.getSenderName(senderId, senderType, thread),
      content,
      messageType,
      timestamp: new Date().toISOString(),
      status: 'sending',
      metadata,
    };

    // Add message to thread
    thread.messages.push(message);
    thread.conversation.lastMessage = message;
    thread.conversation.updatedAt = message.timestamp;

    // Update unread count for other participants
    this.updateUnreadCount(thread, senderId);

    // Simulate message delivery
    setTimeout(() => {
      message.status = 'sent';
      this.notifySubscribers('message_status_updated', { message });
      
      setTimeout(() => {
        message.status = 'delivered';
        this.notifySubscribers('message_status_updated', { message });
      }, 500);
    }, 100);

    // Notify subscribers
    this.notifySubscribers('message_sent', { message, conversation: thread.conversation });

    return message;
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, userId: string): void {
    const thread = this.conversations.get(conversationId);
    if (!thread) return;

    // Mark unread messages as read
    thread.messages.forEach(message => {
      if (message.senderId !== userId && message.status !== 'read') {
        message.status = 'read';
      }
    });

    // Reset unread count
    thread.conversation.unreadCount = 0;

    this.notifySubscribers('messages_read', { conversationId, userId });
  }

  /**
   * Start a new conversation
   */
  async startConversation(
    type: Conversation['type'],
    participants: Conversation['participants'],
    metadata?: Conversation['metadata']
  ): Promise<Conversation> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: Conversation = {
      id: conversationId,
      type,
      participants,
      unreadCount: 0,
      isActive: true,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const thread: ConversationThread = {
      conversation,
      messages: [],
      isTyping: [],
    };

    this.conversations.set(conversationId, thread);

    // Send welcome message if it's customer support
    if (type === 'customer_support') {
      const welcomeTemplate = this.templates.find(t => t.category === 'greeting');
      if (welcomeTemplate) {
        await this.sendMessage(
          conversationId,
          participants.find(p => p.type === 'restaurant')?.id || 'restaurant',
          'restaurant',
          welcomeTemplate.content,
          'quick_reply',
          { quickReplyOptions: welcomeTemplate.quickReplies }
        );
      }
    }

    this.notifySubscribers('conversation_started', { conversation });
    return conversation;
  }

  /**
   * Set typing indicator
   */
  setTyping(conversationId: string, userId: string, userName: string, isTyping: boolean): void {
    const thread = this.conversations.get(conversationId);
    if (!thread) return;

    if (isTyping) {
      // Add typing indicator
      const existingIndex = thread.isTyping.findIndex(t => t.userId === userId);
      if (existingIndex === -1) {
        thread.isTyping.push({
          userId,
          userName,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Remove typing indicator
      thread.isTyping = thread.isTyping.filter(t => t.userId !== userId);
    }

    this.notifySubscribers('typing_updated', { 
      conversationId, 
      isTyping: thread.isTyping 
    });
  }

  /**
   * Get message templates
   */
  getMessageTemplates(category?: MessageTemplate['category']): MessageTemplate[] {
    return this.templates.filter(template => 
      template.isActive && (category ? template.category === category : true)
    );
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(
    conversationId: string,
    senderId: string,
    templateId: string,
    variables?: Record<string, string>
  ): Promise<Message> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;
    
    // Replace variables in template
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(`[${key.toUpperCase()}]`, value);
      });
    }

    return this.sendMessage(
      conversationId,
      senderId,
      'restaurant',
      content,
      template.quickReplies ? 'quick_reply' : 'text',
      template.quickReplies ? { quickReplyOptions: template.quickReplies } : undefined
    );
  }

  /**
   * Search conversations
   */
  searchConversations(query: string, filters?: {
    type?: Conversation['type'];
    priority?: string;
    hasUnread?: boolean;
  }): Conversation[] {
    return Array.from(this.conversations.values())
      .map(thread => thread.conversation)
      .filter(conv => {
        // Text search
        const searchMatch = query === '' || 
          conv.participants.some(p => p.name.toLowerCase().includes(query.toLowerCase())) ||
          (conv.lastMessage && conv.lastMessage.content.toLowerCase().includes(query.toLowerCase()));
        
        if (!searchMatch) return false;

        // Apply filters
        if (filters) {
          if (filters.type && conv.type !== filters.type) return false;
          if (filters.priority && conv.metadata?.priority !== filters.priority) return false;
          if (filters.hasUnread !== undefined && (conv.unreadCount > 0) !== filters.hasUnread) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(): {
    total: number;
    unread: number;
    byType: Record<Conversation['type'], number>;
    byPriority: Record<string, number>;
    responseTime: number; // in minutes
  } {
    const conversations = Array.from(this.conversations.values()).map(t => t.conversation);
    
    const stats = {
      total: conversations.length,
      unread: conversations.filter(c => c.unreadCount > 0).length,
      byType: {
        customer_support: conversations.filter(c => c.type === 'customer_support').length,
        driver_coordination: conversations.filter(c => c.type === 'driver_coordination').length,
        order_specific: conversations.filter(c => c.type === 'order_specific').length,
      },
      byPriority: {
        low: conversations.filter(c => c.metadata?.priority === 'low').length,
        medium: conversations.filter(c => c.metadata?.priority === 'medium').length,
        high: conversations.filter(c => c.metadata?.priority === 'high').length,
        urgent: conversations.filter(c => c.metadata?.priority === 'urgent').length,
      },
      responseTime: 5.2, // Mock average response time in minutes
    };

    return stats;
  }

  // Subscription methods
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);

    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in message subscription callback for ${event}:`, error);
        }
      });
    }
  }

  // Helper methods
  private getSenderName(senderId: string, senderType: string, thread: ConversationThread): string {
    const participant = thread.conversation.participants.find(p => p.id === senderId);
    return participant?.name || `${senderType.charAt(0).toUpperCase() + senderType.slice(1)}`;
  }

  private updateUnreadCount(thread: ConversationThread, senderId: string): void {
    // Count unread messages for other participants
    const otherParticipants = thread.conversation.participants.filter(p => p.id !== senderId);
    if (otherParticipants.length > 0) {
      thread.conversation.unreadCount += 1;
    }
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
