import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, History, Trophy, Timer, TrendingUp } from 'lucide-react-native';
import ActiveWorkout from './ActiveWorkout';
import WorkoutHistory from './WorkoutHistory';
import WorkoutTemplates from './WorkoutTemplates';
import PersonalRecords from './PersonalRecords';
import QuickStartWorkout from './QuickStartWorkout';

type TabType = 'active' | 'history' | 'templates' | 'records';

export default function WorkoutScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);

  const tabs = [
    { id: 'active' as TabType, label: 'Active', icon: Timer },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'templates' as TabType, label: 'Templates', icon: Plus },
    { id: 'records' as TabType, label: 'PRs', icon: Trophy },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'active':
        return hasActiveWorkout ? (
          <ActiveWorkout onEndWorkout={() => setHasActiveWorkout(false)} />
        ) : (
          <QuickStartWorkout onStartWorkout={() => setHasActiveWorkout(true)} />
        );
      case 'history':
        return <WorkoutHistory />;
      case 'templates':
        return <WorkoutTemplates onSelectTemplate={() => {
          setHasActiveWorkout(true);
          setActiveTab('active');
        }} />;
      case 'records':
        return <PersonalRecords />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Tracker</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.statText}>7 day streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                size={20}
                color={activeTab === tab.id ? '#6366f1' : '#6b7280'}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ede9fe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366f1',
  },
  content: {
    flex: 1,
  },
});
