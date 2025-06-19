import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Package, AlertTriangle, TrendingDown, Wifi, WifiOff } from 'lucide-react-native';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  isAvailable: boolean;
  lastUpdated: string;
  salesRate: number; // items per hour
  estimatedStockOut: string | null;
}

interface RealTimeInventoryProps {
  restaurantId: string;
  onStockUpdate: (itemId: string, newStock: number) => void;
  onAvailabilityChange: (itemId: string, isAvailable: boolean) => void;
}

export function RealTimeInventory({
  restaurantId,
  onStockUpdate,
  onAvailabilityChange,
}: RealTimeInventoryProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Grilled Salmon Power Bowl',
      currentStock: 3,
      minimumStock: 10,
      isAvailable: true,
      lastUpdated: '2 min ago',
      salesRate: 2.5,
      estimatedStockOut: '1.2 hours',
    },
    {
      id: '2',
      name: 'Quinoa Buddha Bowl',
      currentStock: 0,
      minimumStock: 12,
      isAvailable: false,
      lastUpdated: '5 min ago',
      salesRate: 1.8,
      estimatedStockOut: null,
    },
    {
      id: '3',
      name: 'Protein Smoothie',
      currentStock: 8,
      minimumStock: 15,
      isAvailable: true,
      lastUpdated: '1 min ago',
      salesRate: 3.2,
      estimatedStockOut: '2.5 hours',
    },
  ]);

  useEffect(() => {
    // Simulate real-time inventory updates
    const interval = setInterval(() => {
      simulateInventoryUpdates();
      setLastSync(new Date());
    }, 30000); // Update every 30 seconds

    // Simulate connection status changes
    const connectionInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of connection issues
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 5000);
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, []);

  const simulateInventoryUpdates = () => {
    setInventoryItems(prev => prev.map(item => {
      // Simulate sales reducing stock
      if (Math.random() < 0.3 && item.currentStock > 0) {
        const newStock = Math.max(0, item.currentStock - 1);
        const estimatedStockOut = newStock > 0 
          ? `${(newStock / item.salesRate).toFixed(1)} hours`
          : null;
        
        // Auto-disable if stock reaches zero
        const isAvailable = newStock > 0 ? item.isAvailable : false;
        
        // Trigger callbacks
        onStockUpdate(item.id, newStock);
        if (isAvailable !== item.isAvailable) {
          onAvailabilityChange(item.id, isAvailable);
        }

        return {
          ...item,
          currentStock: newStock,
          isAvailable,
          lastUpdated: 'Just now',
          estimatedStockOut,
        };
      }
      return item;
    }));
  };

  const toggleAvailability = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.currentStock === 0 && !item.isAvailable) {
      Alert.alert(
        'Out of Stock',
        'Cannot enable item with zero stock. Please restock first.',
        [{ text: 'OK' }]
      );
      return;
    }

    setInventoryItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
    ));
    
    onAvailabilityChange(itemId, !item.isAvailable);
  };

  const restockItem = (itemId: string) => {
    Alert.alert(
      'Restock Item',
      'How many units would you like to add?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '+5',
          onPress: () => updateStock(itemId, 5),
        },
        {
          text: '+10',
          onPress: () => updateStock(itemId, 10),
        },
        {
          text: '+20',
          onPress: () => updateStock(itemId, 20),
        },
      ]
    );
  };

  const updateStock = (itemId: string, additionalStock: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = item.currentStock + additionalStock;
        const estimatedStockOut = newStock > 0 
          ? `${(newStock / item.salesRate).toFixed(1)} hours`
          : null;
        
        onStockUpdate(itemId, newStock);
        
        return {
          ...item,
          currentStock: newStock,
          isAvailable: newStock > 0,
          lastUpdated: 'Just now',
          estimatedStockOut,
        };
      }
      return item;
    }));
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'out', color: '#EF4444', text: 'Out of Stock' };
    if (item.currentStock <= item.minimumStock) return { status: 'low', color: '#F59E0B', text: 'Low Stock' };
    return { status: 'good', color: '#10B981', text: 'In Stock' };
  };

  const lowStockCount = inventoryItems.filter(item => 
    item.currentStock <= item.minimumStock && item.currentStock > 0
  ).length;
  
  const outOfStockCount = inventoryItems.filter(item => item.currentStock === 0).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Real-Time Inventory</Text>
          <View style={styles.connectionStatus}>
            {isConnected ? (
              <Wifi size={16} color="#10B981" />
            ) : (
              <WifiOff size={16} color="#EF4444" />
            )}
            <Text style={[
              styles.connectionText,
              { color: isConnected ? '#10B981' : '#EF4444' }
            ]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <Text style={styles.lastSync}>
          Last sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Package size={20} color="#10B981" />
          <Text style={styles.summaryNumber}>{inventoryItems.length}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={styles.summaryCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <Text style={styles.summaryNumber}>{lowStockCount}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        <View style={styles.summaryCard}>
          <TrendingDown size={20} color="#EF4444" />
          <Text style={styles.summaryNumber}>{outOfStockCount}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Inventory Items */}
      {inventoryItems.map((item) => {
        const stockStatus = getStockStatus(item);
        
        return (
          <View key={item.id} style={styles.inventoryCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.lastUpdated}>Updated {item.lastUpdated}</Text>
              </View>
              
              <View style={styles.stockIndicator}>
                <View style={[styles.stockDot, { backgroundColor: stockStatus.color }]} />
                <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
                  {stockStatus.text}
                </Text>
              </View>
            </View>

            <View style={styles.stockDetails}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockNumber}>{item.currentStock}</Text>
                <Text style={styles.stockLabel}>Current Stock</Text>
              </View>
              
              <View style={styles.stockActions}>
                <TouchableOpacity
                  style={styles.restockButton}
                  onPress={() => restockItem(item.id)}
                >
                  <Text style={styles.restockButtonText}>Restock</Text>
                </TouchableOpacity>
                
                <View style={styles.availabilityToggle}>
                  <Text style={styles.toggleLabel}>Available</Text>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={() => toggleAvailability(item.id)}
                    trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                    thumbColor={item.isAvailable ? '#10B981' : '#FFFFFF'}
                    disabled={item.currentStock === 0}
                  />
                </View>
              </View>
            </View>

            {/* Analytics */}
            <View style={styles.analytics}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>Sales Rate</Text>
                <Text style={styles.analyticsValue}>{item.salesRate}/hr</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsLabel}>Min Stock</Text>
                <Text style={styles.analyticsValue}>{item.minimumStock}</Text>
              </View>
              {item.estimatedStockOut && (
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Stock Out In</Text>
                  <Text style={[styles.analyticsValue, { color: '#F59E0B' }]}>
                    {item.estimatedStockOut}
                  </Text>
                </View>
              )}
            </View>

            {/* Warnings */}
            {item.currentStock === 0 && (
              <View style={styles.warningCard}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={styles.warningText}>
                  Item automatically disabled due to zero stock
                </Text>
              </View>
            )}
            
            {item.currentStock > 0 && item.currentStock <= item.minimumStock && (
              <View style={styles.warningCard}>
                <AlertTriangle size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Stock below minimum threshold. Consider restocking soon.
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lastSync: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfo: {
    alignItems: 'center',
  },
  stockNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  stockLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  stockActions: {
    alignItems: 'flex-end',
  },
  restockButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  restockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  analytics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },
});
