import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Phone, Mail, Search, Clock, CircleCheck as CheckCircle, CircleHelp as HelpCircle, ArrowRight } from 'lucide-react-native';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface AdvancedCustomerSupportProps {
  userId: string;
}

export function AdvancedCustomerSupport({ userId }: AdvancedCustomerSupportProps) {
  const [activeTab, setActiveTab] = useState<'help' | 'tickets' | 'contact'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);

  // Mock data
  const [tickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Order delivery issue',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdate: '2024-01-15T14:20:00Z',
    },
    {
      id: '2',
      subject: 'Subscription billing question',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-10T09:15:00Z',
      lastUpdate: '2024-01-12T16:45:00Z',
    },
  ]);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your profile settings. Go to Profile > Subscription > Cancel Subscription.',
      category: 'Subscription',
    },
    {
      id: '2',
      question: 'What if my order is late?',
      answer: 'If your order is running late, you can track it in real-time from the Orders tab. If it\'s significantly delayed, we\'ll automatically apply a credit to your account.',
      category: 'Orders',
    },
    {
      id: '3',
      question: 'How do I update my dietary preferences?',
      answer: 'Update your dietary preferences in the Fitness tab under Profile Settings. This will help us recommend meals that match your goals.',
      category: 'Account',
    },
  ];

  const contactMethods = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageCircle size={24} color="#10B981" />,
      available: true,
      response: 'Typically responds in 2-3 minutes',
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with a support agent',
      icon: <Phone size={24} color="#3B82F6" />,
      available: true,
      response: 'Available 9 AM - 6 PM EST',
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail size={24} color="#8B5CF6" />,
      available: true,
      response: 'Typically responds in 2-4 hours',
    },
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleContactMethod = (method: string) => {
    switch (method) {
      case 'chat':
        Alert.alert('Live Chat', 'Opening chat with support team...');
        break;
      case 'phone':
        Alert.alert('Phone Support', 'Call (555) 123-4567 for immediate assistance');
        break;
      case 'email':
        Alert.alert('Email Support', 'Opening email composer...');
        break;
    }
  };

  const renderHelpTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Clock size={20} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <MessageCircle size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <HelpCircle size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionText}>Account Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <ArrowRight
                size={16}
                color="#6B7280"
                style={{
                  transform: [{ rotate: selectedFAQ === faq.id ? '90deg' : '0deg' }],
                }}
              />
            </View>
            {selectedFAQ === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderTicketsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support Tickets</Text>
        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <HelpCircle size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No support tickets</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any support tickets yet
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                <View style={styles.ticketBadges}>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.badgeText}>{ticket.status.replace('_', ' ')}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                    <Text style={styles.badgeText}>{ticket.priority}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>
                  Created: {formatDate(ticket.createdAt)}
                </Text>
                <Text style={styles.ticketDate}>
                  Updated: {formatDate(ticket.lastUpdate)}
                </Text>
              </View>
            </View>
          ))
        )}
        
        <TouchableOpacity style={styles.createTicketButton}>
          <Text style={styles.createTicketButtonText}>Create New Ticket</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContactTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <Text style={styles.sectionSubtitle}>
          Choose the best way to reach our support team
        </Text>
        
        {contactMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.contactMethod}
            onPress={() => handleContactMethod(method.id)}
          >
            <View style={styles.contactMethodContent}>
              <View style={styles.contactMethodIcon}>
                {method.icon}
              </View>
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>{method.title}</Text>
                <Text style={styles.contactMethodDescription}>{method.description}</Text>
                <Text style={styles.contactMethodResponse}>{method.response}</Text>
              </View>
            </View>
            <ArrowRight size={16} color="#D1D5DB" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Emergency Contact */}
      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Emergency Support</Text>
        <Text style={styles.emergencyDescription}>
          For urgent delivery or safety issues, call our 24/7 emergency line
        </Text>
        <TouchableOpacity style={styles.emergencyButton}>
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>(555) 911-HELP</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Support Center</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'help', label: 'Help', icon: <HelpCircle size={16} color={activeTab === 'help' ? '#10B981' : '#6B7280'} /> },
          { key: 'tickets', label: 'Tickets', icon: <MessageCircle size={16} color={activeTab === 'tickets' ? '#10B981' : '#6B7280'} /> },
          { key: 'contact', label: 'Contact', icon: <Phone size={16} color={activeTab === 'contact' ? '#10B981' : '#6B7280'} /> },
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as any)}
          >
            {icon}
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'help' && renderHelpTab()}
      {activeTab === 'tickets' && renderTicketsTab()}
      {activeTab === 'contact' && renderContactTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  tabTextActive: {
    color: '#10B981',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  createTicketButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createTicketButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactMethodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactMethodDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactMethodResponse: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  emergencySection: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
