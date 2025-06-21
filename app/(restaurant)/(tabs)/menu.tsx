import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Zap, TrendingUp, DollarSign } from 'lucide-react-native';
import { InventoryManager } from '@/features/restaurant/components/InventoryManager';
import { RealTimeInventory } from '@/features/restaurant/components/RealTimeInventory';
import { MenuIntelligenceDashboard } from '@/features/restaurant/components/MenuIntelligenceDashboard';
import { useAuth } from '@/contexts/AuthContext'

export default function RestaurantMenu() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'realtime' | 'intelligence'>('realtime');
  const { user } = useAuth();
  const restaurantId = user?.id || 'restaurant_1';

  const handleStockUpdate = (itemId: string, newStock: number) => {
    console.log(`Stock updated for item ${itemId}: ${newStock}`);
    // In a real app, this would sync with the backend
  };

  const handleAvailabilityChange = (itemId: string, isAvailable: boolean) => {
    console.log(`Availability changed for item ${itemId}: ${isAvailable}`);
    // In a real app, this would update menu availability in real-time
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert('Add Item', 'Add new menu item functionality')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'intelligence' && styles.tabActive]}
          onPress={() => setActiveTab('intelligence')}
        >
          <Zap size={16} color={activeTab === 'intelligence' ? "#10B981" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === 'intelligence' && styles.tabTextActive]}>
            Menu Intelligence
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'realtime' && styles.tabActive]}
          onPress={() => setActiveTab('realtime')}
        >
          <TrendingUp size={16} color={activeTab === 'realtime' ? "#10B981" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === 'realtime' && styles.tabTextActive]}>
            Real-Time Inventory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.tabActive]}
          onPress={() => setActiveTab('inventory')}
        >
          <DollarSign size={16} color={activeTab === 'inventory' ? "#10B981" : "#6B7280"} />
          <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
            Full Inventory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'intelligence' ? (
          <MenuIntelligenceDashboard restaurantId={restaurantId} />
        ) : activeTab === 'realtime' ? (
          <RealTimeInventory
            restaurantId="restaurant_1"
            onStockUpdate={handleStockUpdate}
            onAvailabilityChange={handleAvailabilityChange}
          />
        ) : (
          <InventoryManager restaurantId="restaurant_1" />
        )}
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
});
