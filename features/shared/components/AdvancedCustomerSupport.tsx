import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { MessageCircle, Phone, Mail, Send } from 'lucide-react-native';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
}

export function AdvancedCustomerSupport() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'contact'>('chat');
  const [message, setMessage] = useState('');
  const [tickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Order delivery issue',
      status: 'pending',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      subject: 'Payment not processed',
      status: 'resolved',
      createdAt: '2024-01-10',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      Alert.alert('Message Sent', 'Your message has been sent to our support team.');
      setMessage('');
    }
  };

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <ScrollView style={styles.chatMessages}>
        <View style={styles.supportMessage}>
          <Text style={styles.messageText}>
            Hi! How can I help you today? I'm here to assist with any questions about your orders, account, or our services.
          </Text>
          <Text style={styles.messageTime}>2:30 PM</Text>
        </View>
      </ScrollView>
      <View style={styles.chatInput}>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTicketsTab = () => (
    <ScrollView style={styles.ticketsContainer}>
      {tickets.map((ticket) => (
        <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: ticket.status === 'resolved' ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: ticket.status === 'resolved' ? '#059669' : '#D97706' }
              ]}>
                {ticket.status}
              </Text>
            </View>
          </View>
          <Text style={styles.ticketDate}>Created: {ticket.createdAt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContactTab = () => (
    <View style={styles.contactContainer}>
      <TouchableOpacity style={styles.contactOption}>
        <Phone size={24} color="#10B981" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Call Us</Text>
          <Text style={styles.contactDetail}>+1 (555) 123-4567</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.contactOption}>
        <Mail size={24} color="#10B981" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Email Support</Text>
          <Text style={styles.contactDetail}>support@zenith.com</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={20} color={activeTab === 'chat' ? '#10B981' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
            Tickets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            Contact
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'tickets' && renderTicketsTab()}
        {activeTab === 'contact' && renderContactTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  supportMessage: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  chatInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketsContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactContainer: {
    padding: 16,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
});
