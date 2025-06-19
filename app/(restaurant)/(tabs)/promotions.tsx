import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Tag, 
  Plus, 
  X, 
  Calendar, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  BarChart2, 
  Percent, 
  Package,
  Check,
  Info
} from 'lucide-react-native';
import { Colors, Layout } from '@/constants';
import { Card } from '@/app/_components/common/Card';
import { Button } from '@/app/_components/common/Button';

// Mock types
type PromotionType = 'percentage' | 'fixed' | 'bogo' | 'bundle' | 'loyalty';
type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'draft';

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
  usage: number;
  limit: number;
  description?: string;
  applicableItems?: string[];
  stackable: boolean;
  redemptionRate?: number;
}

// Mock data
const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Summer Special',
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    minOrderAmount: 50,
    maxDiscount: 30,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    createdAt: '2025-05-15',
    usage: 156,
    limit: 1000,
    description: 'Get 25% off your order with a minimum order of $50. Maximum discount of $30.',
    stackable: false,
    redemptionRate: 23.4,
  },
  {
    id: '2',
    name: 'Protein Pack Bundle',
    code: 'PROTEINPACK',
    type: 'bundle',
    value: 15,
    startDate: '2025-06-15',
    endDate: '2025-07-15',
    status: 'active',
    createdAt: '2025-05-20',
    usage: 89,
    limit: 500,
    description: 'Buy any two protein meals and save $15.',
    applicableItems: ['Grilled Salmon Power Bowl', 'Lean Chicken Mediterranean', 'Keto Power Plate'],
    stackable: false,
    redemptionRate: 18.7,
  },
  {
    id: '3',
    name: 'Buy 1 Get 1 Smoothie',
    code: 'BOGO-SMOOTHIE',
    type: 'bogo',
    value: 100,
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    status: 'scheduled',
    createdAt: '2025-06-10',
    usage: 0,
    limit: 300,
    description: 'Buy one smoothie, get one free. Applies to all smoothies.',
    stackable: false,
  },
  {
    id: '4',
    name: 'Loyalty Discount',
    code: 'LOYAL10',
    type: 'percentage',
    value: 10,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    createdAt: '2024-12-15',
    usage: 412,
    limit: 0,
    description: 'Permanent 10% discount for loyalty members.',
    stackable: true,
    redemptionRate: 68.5,
  },
  {
    id: '5',
    name: 'Spring Break Special',
    code: 'SPRING20',
    type: 'percentage',
    value: 20,
    startDate: '2025-03-01',
    endDate: '2025-04-15',
    status: 'expired',
    createdAt: '2025-02-15',
    usage: 342,
    limit: 500,
    description: '20% off for spring break season',
    stackable: false,
    redemptionRate: 78.2,
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getPromotionTypeLabel = (type: PromotionType): string => {
  switch (type) {
    case 'percentage':
      return 'Percentage Discount';
    case 'fixed':
      return 'Fixed Amount Discount';
    case 'bogo':
      return 'Buy One Get One';
    case 'bundle':
      return 'Bundle Discount';
    case 'loyalty':
      return 'Loyalty Reward';
  }
};

const getPromotionTypeColor = (type: PromotionType): string => {
  switch (type) {
    case 'percentage':
      return Colors.primary;
    case 'fixed':
      return Colors.success;
    case 'bogo':
      return Colors.warning;
    case 'bundle':
      return Colors.info;
    case 'loyalty':
      return Colors.secondary;
  }
};

const getStatusColor = (status: PromotionStatus): string => {
  switch (status) {
    case 'active':
      return Colors.success;
    case 'scheduled':
      return Colors.info;
    case 'expired':
      return Colors.gray[400];
    case 'draft':
      return Colors.warning;
  }
};

const getStatusText = (status: PromotionStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function PromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  // Filter promotions based on active filter and search query
  const filteredPromotions = promotions.filter(promo => {
    const matchesFilter = activeFilter === 'all' || promo.status === activeFilter;
    const matchesSearch = 
      promo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleOpenModal = (promo?: Promotion) => {
    setSelectedPromotion(promo || null);
    setModalVisible(true);
  };

  const handleSavePromotion = (promo: Promotion) => {
    if (promo.id) {
      // Update existing promotion
      setPromotions(prev => prev.map(p => p.id === promo.id ? promo : p));
    } else {
      // Add new promotion
      const newPromo = {
        ...promo,
        id: `promo_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        usage: 0,
        redemptionRate: 0,
      };
      setPromotions(prev => [...prev, newPromo]);
    }
    setModalVisible(false);
  };

  const handleDeletePromotion = (id: string) => {
    setSelectedPromotionId(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (selectedPromotionId) {
      setPromotions(prev => prev.filter(p => p.id !== selectedPromotionId));
      setShowDeleteConfirmation(false);
      setSelectedPromotionId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search promotions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textTertiary}
        />
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleOpenModal()}
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'active', 'scheduled', 'expired'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPromotions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.promotionCard}>
            <View style={styles.promotionHeader}>
              <View>
                <Text style={styles.promotionName}>{item.name}</Text>
                <Text style={styles.promotionCode}>{item.code}</Text>
              </View>
              <View style={styles.promotionStatusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.promotionDetails}>
              <View style={styles.detailItem}>
                <Tag size={16} color={getPromotionTypeColor(item.type)} />
                <Text style={styles.detailText}>{getPromotionTypeLabel(item.type)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </Text>
              </View>
            </View>

            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>
                {item.type === 'percentage' ? 'Discount:' : 
                 item.type === 'fixed' ? 'Amount Off:' :
                 item.type === 'bogo' ? 'Get Free:' :
                 item.type === 'bundle' ? 'Save:' : 'Reward:'}
              </Text>
              <Text style={styles.valueAmount}>
                {item.type === 'percentage' ? `${item.value}%` : `$${item.value.toFixed(2)}`}
              </Text>
              
              {item.minOrderAmount && (
                <Text style={styles.minOrderText}>
                  Min. Order: ${item.minOrderAmount}
                </Text>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Usage</Text>
                <Text style={styles.statValue}>{item.usage} / {item.limit || '∞'}</Text>
              </View>
              
              {item.redemptionRate && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Redemption Rate</Text>
                  <Text style={styles.statValue}>{item.redemptionRate}%</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleOpenModal(item)}
              >
                <Edit2 size={16} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Analytics', 'Showing analytics for ' + item.name)}
              >
                <BarChart2 size={16} color={Colors.info} />
                <Text style={[styles.actionButtonText, { color: Colors.info }]}>Analytics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeletePromotion(item.id)}
              >
                <Trash2 size={16} color={Colors.error} />
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Tag size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No promotions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search or filters' 
                : 'Create your first promotion to attract more customers'}
            </Text>
            <Button 
              title="Create Promotion" 
              onPress={() => handleOpenModal()} 
              style={styles.emptyButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create/Edit Promotion Modal */}
      <PromotionFormModal
        visible={modalVisible}
        promotion={selectedPromotion}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePromotion}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.confirmationModalContainer}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIconContainer}>
              <Trash2 size={32} color={Colors.error} />
            </View>
            <Text style={styles.confirmationTitle}>Delete Promotion</Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface PromotionFormModalProps {
  visible: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (promotion: Promotion) => void;
}

function PromotionFormModal({ visible, promotion, onClose, onSave }: PromotionFormModalProps) {
  const isEditing = !!promotion?.id;
  
  // Initialize form state from promotion or defaults
  const [name, setName] = useState(promotion?.name || '');
  const [code, setCode] = useState(promotion?.code || '');
  const [type, setType] = useState<PromotionType>(promotion?.type || 'percentage');
  const [value, setValue] = useState(promotion?.value?.toString() || '');
  const [minOrderAmount, setMinOrderAmount] = useState(promotion?.minOrderAmount?.toString() || '');
  const [maxDiscount, setMaxDiscount] = useState(promotion?.maxDiscount?.toString() || '');
  const [startDate, setStartDate] = useState(promotion?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(promotion?.endDate || '');
  const [status, setStatus] = useState<PromotionStatus>(promotion?.status || 'draft');
  const [limit, setLimit] = useState(promotion?.limit?.toString() || '');
  const [description, setDescription] = useState(promotion?.description || '');
  const [stackable, setStackable] = useState(promotion?.stackable || false);
  const [applicableItems, setApplicableItems] = useState<string[]>(promotion?.applicableItems || []);
  
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);
  
  const resetForm = () => {
    setName(promotion?.name || '');
    setCode(promotion?.code || '');
    setType(promotion?.type || 'percentage');
    setValue(promotion?.value?.toString() || '');
    setMinOrderAmount(promotion?.minOrderAmount?.toString() || '');
    setMaxDiscount(promotion?.maxDiscount?.toString() || '');
    setStartDate(promotion?.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(promotion?.endDate || '');
    setStatus(promotion?.status || 'draft');
    setLimit(promotion?.limit?.toString() || '');
    setDescription(promotion?.description || '');
    setStackable(promotion?.stackable || false);
    setApplicableItems(promotion?.applicableItems || []);
  };
  
  // Reset form when promotion changes
  React.useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, promotion]);
  
  const validateForm = (): boolean => {
    if (!name) {
      Alert.alert('Error', 'Promotion name is required');
      return false;
    }
    
    if (!code) {
      Alert.alert('Error', 'Promotion code is required');
      return false;
    }
    
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      Alert.alert('Error', 'Please enter a valid value');
      return false;
    }
    
    if (minOrderAmount && (isNaN(Number(minOrderAmount)) || Number(minOrderAmount) < 0)) {
      Alert.alert('Error', 'Minimum order amount must be a valid number');
      return false;
    }
    
    if (maxDiscount && (isNaN(Number(maxDiscount)) || Number(maxDiscount) < 0)) {
      Alert.alert('Error', 'Maximum discount must be a valid number');
      return false;
    }
    
    if (!startDate) {
      Alert.alert('Error', 'Start date is required');
      return false;
    }
    
    if (!endDate) {
      Alert.alert('Error', 'End date is required');
      return false;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Error', 'End date must be after start date');
      return false;
    }
    
    if (limit && (isNaN(Number(limit)) || Number(limit) < 0)) {
      Alert.alert('Error', 'Usage limit must be a valid number');
      return false;
    }
    
    return true;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    const newPromotion: Promotion = {
      id: promotion?.id || '',
      name,
      code,
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate,
      endDate,
      status,
      createdAt: promotion?.createdAt || new Date().toISOString().split('T')[0],
      usage: promotion?.usage || 0,
      limit: limit ? Number(limit) : 0,
      description,
      applicableItems,
      stackable,
      redemptionRate: promotion?.redemptionRate,
    };
    
    onSave(newPromotion);
  };

  const generatePromoCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 8;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setCode(result);
  };
  
  const promotionTypes: { value: PromotionType, label: string, icon: any }[] = [
    { value: 'percentage', label: 'Percentage Discount', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
    { value: 'bogo', label: 'Buy One Get One', icon: Package },
    { value: 'bundle', label: 'Bundle Discount', icon: Package },
    { value: 'loyalty', label: 'Loyalty Reward', icon: Award },
  ];
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Promotion' : 'Create Promotion'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Promotion Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="E.g., Summer Special"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Promo Code</Text>
                  <View style={styles.codeInputContainer}>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      value={code}
                      onChangeText={setCode}
                      placeholder="E.g., SUMMER25"
                      placeholderTextColor={Colors.textTertiary}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity 
                      style={styles.generateButton}
                      onPress={generatePromoCode}
                    >
                      <Text style={styles.generateButtonText}>Generate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Promotion Type</Text>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setTypeDropdownVisible(!typeDropdownVisible)}
                >
                  <View style={styles.selectedTypeContainer}>
                    {promotionTypes.find(t => t.value === type)?.icon({ 
                      size: 16, 
                      color: getPromotionTypeColor(type) 
                    })}
                    <Text style={styles.dropdownText}>
                      {getPromotionTypeLabel(type)}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                
                {typeDropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    {promotionTypes.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.dropdownItem,
                          type === item.value && styles.selectedDropdownItem
                        ]}
                        onPress={() => {
                          setType(item.value);
                          setTypeDropdownVisible(false);
                        }}
                      >
                        <View style={styles.dropdownItemContent}>
                          <item.icon size={16} color={getPromotionTypeColor(item.value)} />
                          <Text style={styles.dropdownItemText}>{item.label}</Text>
                        </View>
                        {type === item.value && (
                          <Check size={16} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Discount Settings</Text>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>
                    {type === 'percentage' ? 'Discount (%)' : 
                     type === 'fixed' ? 'Amount Off ($)' :
                     type === 'bogo' ? 'Discount (%)' :
                     type === 'bundle' ? 'Amount Off ($)' : 'Points'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder="Enter value"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                
                {(type === 'percentage' || type === 'fixed') && (
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>Min Order Amount ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={minOrderAmount}
                      onChangeText={setMinOrderAmount}
                      placeholder="Optional"
                      placeholderTextColor={Colors.textTertiary}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>
              
              {type === 'percentage' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Maximum Discount ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={maxDiscount}
                    onChangeText={setMaxDiscount}
                    placeholder="Optional"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Applicable Items</Text>
                <TouchableOpacity style={styles.selectItemsButton}>
                  <Text style={styles.selectItemsButtonText}>
                    {applicableItems.length 
                      ? `${applicableItems.length} items selected` 
                      : 'All menu items'}
                  </Text>
                  <ChevronDown size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.switchGroup}>
                <View>
                  <Text style={styles.switchLabel}>Stackable with other promotions</Text>
                  <Text style={styles.switchDescription}>Allow customers to use this with other discounts</Text>
                </View>
                <Switch
                  value={stackable}
                  onValueChange={setStackable}
                  trackColor={{ false: Colors.gray[300], true: Colors.primary + '40' }}
                  thumbColor={stackable ? Colors.primary : Colors.gray[100]}
                />
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Promotion Schedule</Text>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => Alert.alert('Date Picker', 'This would open a date picker')}
                  >
                    <Text style={styles.dateText}>
                      {startDate ? formatDate(startDate) : 'Select date'}
                    </Text>
                    <Calendar size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => Alert.alert('Date Picker', 'This would open a date picker')}
                  >
                    <Text style={styles.dateText}>
                      {endDate ? formatDate(endDate) : 'Select date'}
                    </Text>
                    <Calendar size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Usage Limit</Text>
                <TextInput
                  style={styles.input}
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="Leave empty for unlimited"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add details about this promotion"
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.statusGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusButtons}>
                  {(['draft', 'scheduled', 'active', 'expired'] as PromotionStatus[]).map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption}
                      style={[
                        styles.statusButton,
                        status === statusOption && styles.statusButtonActive,
                      ]}
                      onPress={() => setStatus(statusOption)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          status === statusOption && styles.statusButtonTextActive,
                        ]}
                      >
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update Promotion' : 'Create Promotion'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.gray[100],
  },
  activeFilterTab: {
    backgroundColor: Colors.primary + '15',
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeFilterText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  promotionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  promotionCode: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  promotionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  promotionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
  },
  valueLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    marginRight: 12,
  },
  minOrderText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    width: '90%',
    maxWidth: 500,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  formSection: {
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    right: 0,
  },
  generateButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5, // For Android
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDropdownItem: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  dateInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectItemsButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectItemsButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: Colors.textTertiary,
    maxWidth: 250,
  },
  statusGroup: {
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  statusButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusButtonTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  formButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  
  // Confirmation Modal Styles
  confirmationModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  confirmationModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmationIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  confirmationButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});