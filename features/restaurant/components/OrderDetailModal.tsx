import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { X, ChevronDown, CircleCheck as CheckCircle, Clock, Phone, MapPin, MessageCircle } from 'lucide-react-native';
import { OrderStatusBadge } from '@/features/shared/components/OrderStatusBadge';
import { DriverSelector } from './DriverSelector';

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
  specialInstructions?: string;
  driver?: {
    id: string;
    name: string;
    phoneNumber: string;
    rating: number;
  };
}

interface OrderDetailModalProps {
  order: Order;
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onUpdateStatus: (status: string) => void;
}

export function OrderDetailModal({
  order,
  visible,
  onClose,
  onAccept,
  onReject,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const [estimatedPrepTime, setEstimatedPrepTime] = useState('25');
  const [showDriverSelector, setShowDriverSelector] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusSteps = [
    { value: 'pending', label: 'Received' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const getCurrentStatusIndex = () => {
    return statusSteps.findIndex((step) => step.value === order.status);
  };

  const getNextStatusValues = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex < 0 || currentIndex >= statusSteps.length - 1) return [];
    return statusSteps.slice(currentIndex + 1);
  };

  const getStatusProgress = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex < 0) return 0;
    return (currentIndex / (statusSteps.length - 1)) * 100;
  };

  const contactCustomer = (method: 'phone' | 'message') => {
    console.log(`Contact customer by ${method}`);
    if (method === 'phone') {
      // In a real app, this would use Linking to make a phone call
      console.log(`Call ${order.customer.phoneNumber}`);
    } else {
      // Open messaging interface
      console.log(`Message ${order.customer.phoneNumber}`);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    console.log(`Selected driver: ${driverId}`);
    setShowDriverSelector(false);
    // In a real app, this would update the order with the selected driver
  };

  const renderActionButtons = () => {
    switch (order.status) {
      case 'pending':
      case 'restaurant_assigned':
        return (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
      case 'preparing':
      case 'ready':
        return (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.nextStatusButton}
              onPress={() => {
                const nextSteps = getNextStatusValues();
                if (nextSteps.length > 0) {
                  onUpdateStatus(nextSteps[0].value);
                }
              }}
            >
              <Text style={styles.nextStatusButtonText}>
                Mark as {getNextStatusValues()[0]?.label || 'Updated'}
              </Text>
              <ChevronDown size={16} color="#FFFFFF" style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order #{order.id.slice(-6)}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Order Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusHeader}>
                <OrderStatusBadge status={order.status as any} />
                <Text style={styles.orderTime}>
                  {formatDateTime(order.createdAt)}
                </Text>
              </View>

              <View style={styles.statusProgressContainer}>
                <View style={styles.statusProgressBar}>
                  <View
                    style={[
                      styles.statusProgressFill,
                      { width: `${getStatusProgress()}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statusSteps}>
                {statusSteps.map((step, index) => {
                  const isActive = getCurrentStatusIndex() >= index;
                  return (
                    <View key={step.value} style={styles.statusStep}>
                      <View
                        style={[
                          styles.statusDot,
                          isActive && styles.statusDotActive,
                        ]}
                      >
                        {isActive && <CheckCircle size={14} color="#10B981" />}
                      </View>
                      <Text
                        style={[
                          styles.statusLabel,
                          isActive && styles.statusLabelActive,
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customer.name}</Text>
                
                <View style={styles.customerDetail}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.customerDetailText}>{order.customer.address}</Text>
                </View>
                
                <View style={styles.customerDetail}>
                  <Phone size={16} color="#6B7280" />
                  <Text style={styles.customerDetailText}>{order.customer.phoneNumber}</Text>
                </View>
              </View>
              
              <View style={styles.customerActions}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => contactCustomer('message')}
                >
                  <MessageCircle size={20} color="#3B82F6" />
                  <Text style={styles.contactButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => contactCustomer('phone')}
                >
                  <Phone size={20} color="#3B82F6" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              {order.items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                    <View style={styles.orderItemDetails}>
                      <Text style={styles.orderItemName}>{item.name}</Text>
                      {item.specialInstructions && (
                        <Text style={styles.orderItemInstructions}>
                          {item.specialInstructions}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.orderItemPrice}>${item.totalPrice.toFixed(2)}</Text>
                </View>
              ))}
              
              {order.specialInstructions && (
                <View style={styles.specialInstructions}>
                  <Text style={styles.specialInstructionsLabel}>Special Instructions:</Text>
                  <Text style={styles.specialInstructionsText}>{order.specialInstructions}</Text>
                </View>
              )}
              
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>${order.taxAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>${order.totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Preparation Controls - only show for certain statuses */}
            {(order.status === 'pending' || order.status === 'restaurant_assigned' || order.status === 'accepted') && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Preparation Details</Text>
                <View style={styles.prepTimeContainer}>
                  <View style={styles.prepTimeLabel}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.prepTimeLabelText}>Estimated Preparation Time</Text>
                  </View>
                  <View style={styles.prepTimeInputContainer}>
                    <TextInput
                      style={styles.prepTimeInput}
                      value={estimatedPrepTime}
                      onChangeText={setEstimatedPrepTime}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.prepTimeUnit}>min</Text>
                  </View>
                </View>
                <View style={styles.prepNotesContainer}>
                  <Text style={styles.prepNotesLabel}>Preparation Notes (Kitchen Only)</Text>
                  <TextInput
                    style={styles.prepNotesInput}
                    value={prepNotes}
                    onChangeText={setPrepNotes}
                    placeholder="Add notes for kitchen staff"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            {/* Driver Assignment - only show for 'preparing' or 'ready' orders */}
            {(order.status === 'preparing' || order.status === 'ready') && !order.driver && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Driver Assignment</Text>
                <TouchableOpacity
                  style={styles.driverSelectionButton}
                  onPress={() => setShowDriverSelector(true)}
                >
                  <Text style={styles.driverSelectionButtonText}>
                    Assign a Driver
                  </Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}

            {/* Driver Info - show if driver is assigned */}
            {order.driver && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Driver Information</Text>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{order.driver.name}</Text>
                  <Text style={styles.driverRating}>★ {order.driver.rating.toFixed(1)}</Text>
                  <Text style={styles.driverPhone}>{order.driver.phoneNumber}</Text>
                </View>
                <View style={styles.customerActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                  >
                    <MessageCircle size={20} color="#3B82F6" />
                    <Text style={styles.contactButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                  >
                    <Phone size={20} color="#3B82F6" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            {renderActionButtons()}
          </View>
        </View>
      </View>

      {/* Driver Selector Modal */}
      <DriverSelector
        visible={showDriverSelector}
        onClose={() => setShowDriverSelector(false)}
        onSelectDriver={handleDriverSelect}
        restaurantLocation={{
          latitude: 40.7128,
          longitude: -74.0060,
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
    maxHeight: '70%',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusProgressContainer: {
    marginBottom: 16,
  },
  statusProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statusProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  statusSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusStep: {
    alignItems: 'center',
    width: 60,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusDotActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  statusLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusLabelActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  customerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerDetailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderItemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
    width: 24,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  orderItemInstructions: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  specialInstructions: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  specialInstructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  specialInstructionsText: {
    fontSize: 14,
    color: '#92400E',
  },
  orderSummary: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  prepTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prepTimeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTimeLabelText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  prepTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prepTimeInput: {
    width: 40,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  prepTimeUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  prepNotesContainer: {
    marginBottom: 8,
  },
  prepNotesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  prepNotesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    height: 80,
  },
  driverSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  driverSelectionButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  driverInfo: {
    marginBottom: 16,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  nextStatusButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
  },
  nextStatusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
