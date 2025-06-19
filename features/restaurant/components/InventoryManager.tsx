import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Package, AlertTriangle, TrendingDown, Edit3 } from 'lucide-react-native';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  maxStock: number;
  isAvailable: boolean;
  price: number;
  soldToday: number;
  category: string;
}

interface InventoryManagerProps {
  restaurantId: string;
}

export function InventoryManager({ restaurantId }: InventoryManagerProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Grilled Salmon Power Bowl',
      currentStock: 5,
      minimumStock: 10,
      maxStock: 50,
      isAvailable: true,
      price: 18.99,
      soldToday: 12,
      category: 'Main Dishes',
    },
    {
      id: '2',
      name: 'Lean Chicken Mediterranean',
      currentStock: 25,
      minimumStock: 15,
      maxStock: 40,
      isAvailable: true,
      price: 16.50,
      soldToday: 8,
      category: 'Main Dishes',
    },
    {
      id: '3',
      name: 'Protein-Packed Quinoa Bowl',
      currentStock: 0,
      minimumStock: 12,
      maxStock: 30,
      isAvailable: false,
      price: 14.99,
      soldToday: 15,
      category: 'Vegetarian',
    },
  ]);

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<string>('');

  const updateStock = (itemId: string, newStock: number) => {
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              currentStock: newStock,
              isAvailable: newStock > 0,
            }
          : item
      )
    );
  };

  const toggleAvailability = (itemId: string) => {
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditStock(item.currentStock.toString());
  };

  const saveEdit = (itemId: string) => {
    const newStock = parseInt(editStock);
    if (isNaN(newStock) || newStock < 0) {
      Alert.alert('Invalid Stock', 'Please enter a valid stock number');
      return;
    }

    updateStock(itemId, newStock);
    setEditingItem(null);
    setEditStock('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditStock('');
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'out', color: '#EF4444' };
    if (item.currentStock <= item.minimumStock) return { status: 'low', color: '#F59E0B' };
    return { status: 'good', color: '#10B981' };
  };

  const lowStockItems = inventoryItems.filter(item => 
    item.currentStock <= item.minimumStock && item.currentStock > 0
  );
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Package size={24} color="#10B981" />
          <Text style={styles.summaryNumber}>{inventoryItems.length}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={styles.summaryCard}>
          <AlertTriangle size={24} color="#F59E0B" />
          <Text style={styles.summaryNumber}>{lowStockItems.length}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        <View style={styles.summaryCard}>
          <TrendingDown size={24} color="#EF4444" />
          <Text style={styles.summaryNumber}>{outOfStockItems.length}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Inventory Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu Items</Text>
        
        {inventoryItems.map((item) => {
          const stockStatus = getStockStatus(item);
          const isEditing = editingItem === item.id;
          
          return (
            <View key={item.id} style={styles.inventoryCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={() => toggleAvailability(item.id)}
                    trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                    thumbColor={item.isAvailable ? '#10B981' : '#FFFFFF'}
                  />
                </View>
              </View>

              <View style={styles.stockSection}>
                <View style={styles.stockInfo}>
                  <View style={styles.stockIndicator}>
                    <View
                      style={[
                        styles.stockDot,
                        { backgroundColor: stockStatus.color },
                      ]}
                    />
                    <Text style={styles.stockLabel}>Current Stock</Text>
                  </View>
                  
                  {isEditing ? (
                    <View style={styles.editStockContainer}>
                      <TextInput
                        style={styles.editStockInput}
                        value={editStock}
                        onChangeText={setEditStock}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => saveEdit(item.id)}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEdit}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.stockValue}
                      onPress={() => startEditing(item)}
                    >
                      <Text style={styles.stockNumber}>{item.currentStock}</Text>
                      <Edit3 size={16} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.stockDetails}>
                  <Text style={styles.stockDetail}>
                    Min: {item.minimumStock} • Max: {item.maxStock}
                  </Text>
                  <Text style={styles.stockDetail}>
                    Sold today: {item.soldToday}
                  </Text>
                </View>

                {/* Stock Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                          backgroundColor: stockStatus.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round((item.currentStock / item.maxStock) * 100)}%
                  </Text>
                </View>

                {/* Warning Messages */}
                {item.currentStock === 0 && (
                  <View style={styles.warningMessage}>
                    <AlertTriangle size={16} color="#EF4444" />
                    <Text style={styles.warningText}>
                      Item is out of stock and unavailable to customers
                    </Text>
                  </View>
                )}
                
                {item.currentStock > 0 && item.currentStock <= item.minimumStock && (
                  <View style={styles.warningMessage}>
                    <AlertTriangle size={16} color="#F59E0B" />
                    <Text style={styles.warningText}>
                      Stock is running low. Consider restocking soon.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inventoryCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  stockSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockNumber: {
    fontSize: 18,
    fontWeight: '700',
    
    color: '#111827',
    marginRight: 8,
  },
  editStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editStockInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    width: 60,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stockDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 35,
    textAlign: 'right',
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});
