import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Activity, Target, Brain, BarChart3, Award } from 'lucide-react-native';
import BodyMetricsTracker from './BodyMetricsTracker';
import FlexibleGoalsManager from './FlexibleGoalsManager';
import AdvancedAnalytics from './AdvancedAnalytics';

type TabType = 'metrics' | 'goals' | 'analytics' | 'achievements';

export default function FitnessScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');

  const tabs = [
    { id: 'metrics' as TabType, label: 'Body Metrics', icon: Activity },
    { id: 'goals' as TabType, label: 'Goals', icon: Target },
    { id: 'analytics' as TabType, label: 'Analytics', icon: Brain },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'metrics':
        return <BodyMetricsTracker />;
      case 'goals':
        return <FlexibleGoalsManager />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'achievements':
        return (
          <View style={styles.comingSoon}>
            <Award size={40} color="#6b7280" />
            <Text style={styles.comingSoonText}>Achievements Coming Soon</Text>
            <Text style={styles.comingSoonSubtext}>
              Track your fitness milestones and earn rewards
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.tabBar}>
        <View style={styles.tabBarContent}>
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
      </ScrollView>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ede9fe',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#6366f1',
  },
  content: {
    flex: 1,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
