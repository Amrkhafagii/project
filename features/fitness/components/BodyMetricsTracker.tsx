import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { logBodyMetrics, getBodyMetricsHistory, getBodyCompositionAnalysis } from '../../../services/fitness/bodyMetricsService';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function BodyMetricsTracker() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    waist_cm: '',
    chest_cm: '',
    hip_cm: '',
    arm_cm: '',
    thigh_cm: '',
    resting_heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    notes: ''
  });
  const [history, setHistory] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'body_fat' | 'measurements'>('weight');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMetricsData();
    }
  }, [user]);

  const loadMetricsData = async () => {
    try {
      const [historyData, compositionData] = await Promise.all([
        getBodyMetricsHistory(user!.id, 90),
        getBodyCompositionAnalysis(user!.id)
      ]);
      
      setHistory(historyData);
      setAnalysis(compositionData);
      
      // Pre-fill with latest metrics
      if (historyData.length > 0) {
        const latest = historyData[0];
        setMetrics({
          weight_kg: latest.weight_kg?.toString() || '',
          body_fat_percentage: latest.body_fat_percentage?.toString() || '',
          waist_cm: latest.waist_cm?.toString() || '',
          chest_cm: latest.chest_cm?.toString() || '',
          hip_cm: latest.hip_cm?.toString() || '',
          arm_cm: latest.arm_cm?.toString() || '',
          thigh_cm: latest.thigh_cm?.toString() || '',
          resting_heart_rate: latest.resting_heart_rate?.toString() || '',
          blood_pressure_systolic: latest.blood_pressure_systolic?.toString() || '',
          blood_pressure_diastolic: latest.blood_pressure_diastolic?.toString() || '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error loading metrics data:', error);
    }
  };

  const handleSaveMetrics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const metricsToSave = {
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight_kg: metrics.weight_kg ? parseFloat(metrics.weight_kg) : undefined,
        body_fat_percentage: metrics.body_fat_percentage ? parseFloat(metrics.body_fat_percentage) : undefined,
        waist_cm: metrics.waist_cm ? parseInt(metrics.waist_cm) : undefined,
        chest_cm: metrics.chest_cm ? parseInt(metrics.chest_cm) : undefined,
        hip_cm: metrics.hip_cm ? parseInt(metrics.hip_cm) : undefined,
        arm_cm: metrics.arm_cm ? parseInt(metrics.arm_cm) : undefined,
        thigh_cm: metrics.thigh_cm ? parseInt(metrics.thigh_cm) : undefined,
        resting_heart_rate: metrics.resting_heart_rate ? parseInt(metrics.resting_heart_rate) : undefined,
        blood_pressure_systolic: metrics.blood_pressure_systolic ? parseInt(metrics.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: metrics.blood_pressure_diastolic ? parseInt(metrics.blood_pressure_diastolic) : undefined,
        notes: metrics.notes || undefined
      };

      await logBodyMetrics(metricsToSave);
      Alert.alert('Success', 'Body metrics saved successfully!');
      await loadMetricsData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save body metrics');
      console.error('Error saving metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const sortedHistory = [...history].reverse();
    const labels = sortedHistory.slice(-7).map(h => {
      const date = new Date(h.log_date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let data: number[] = [];
    if (selectedMetric === 'weight') {
      data = sortedHistory.slice(-7).map(h => h.weight_kg || 0);
    } else if (selectedMetric === 'body_fat') {
      data = sortedHistory.slice(-7).map(h => h.body_fat_percentage || 0);
    } else {
      data = sortedHistory.slice(-7).map(h => h.waist_cm || 0);
    }

    return {
      labels,
      datasets: [{
        data: data.length > 0 ? data : [0]
      }]
    };
  };

  const renderTrend = (current: number, previous: number) => {
    if (!current || !previous) return <Minus size={16} color="#666" />;
    
    const change = current - previous;
    if (Math.abs(change) < 0.1) return <Minus size={16} color="#666" />;
    
    return change > 0 
      ? <TrendingUp size={16} color="#ef4444" />
      : <TrendingDown size={16} color="#10b981" />;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Body Metrics Tracker</Text>
        <Text style={styles.subtitle}>Track your physical progress</Text>
      </View>

      {/* Chart Section */}
      {history.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.metricSelector}>
            <TouchableOpacity
              style={[styles.metricButton, selectedMetric === 'weight' && styles.metricButtonActive]}
              onPress={() => setSelectedMetric('weight')}
            >
              <Text style={[styles.metricButtonText, selectedMetric === 'weight' && styles.metricButtonTextActive]}>
                Weight
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.metricButton, selectedMetric === 'body_fat' && styles.metricButtonActive]}
              onPress={() => setSelectedMetric('body_fat')}
            >
              <Text style={[styles.metricButtonText, selectedMetric === 'body_fat' && styles.metricButtonTextActive]}>
                Body Fat %
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.metricButton, selectedMetric === 'measurements' && styles.metricButtonActive]}
              onPress={() => setSelectedMetric('measurements')}
            >
              <Text style={[styles.metricButtonText, selectedMetric === 'measurements' && styles.metricButtonTextActive]}>
                Waist
              </Text>
            </TouchableOpacity>
          </View>

          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#6366f1'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Body Composition Analysis */}
      {analysis && (
        <View style={styles.analysisCard}>
          <Text style={styles.sectionTitle}>Body Composition Analysis</Text>
          
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>BMI</Text>
            <View style={styles.analysisValue}>
              <Text style={styles.analysisNumber}>{analysis.bmi.value.toFixed(1)}</Text>
              <Text style={styles.analysisCategory}>{analysis.bmi.category}</Text>
            </View>
          </View>

          {analysis.body_composition.lean_mass_kg && (
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Lean Mass</Text>
              <Text style={styles.analysisNumber}>{analysis.body_composition.lean_mass_kg.toFixed(1)} kg</Text>
            </View>
          )}

          {analysis.body_composition.fat_mass_kg && (
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Fat Mass</Text>
              <Text style={styles.analysisNumber}>{analysis.body_composition.fat_mass_kg.toFixed(1)} kg</Text>
            </View>
          )}

          {analysis.recommendations.length > 0 && (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {analysis.recommendations.map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendation}>• {rec}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Input Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Log Today's Metrics</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupTitle}>Basic Measurements</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={metrics.weight_kg}
                onChangeText={(text) => setMetrics({...metrics, weight_kg: text})}
                keyboardType="decimal-pad"
                placeholder="70.5"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Body Fat %</Text>
              <TextInput
                style={styles.input}
                value={metrics.body_fat_percentage}
                onChangeText={(text) => setMetrics({...metrics, body_fat_percentage: text})}
                keyboardType="decimal-pad"
                placeholder="15.0"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupTitle}>Body Measurements (cm)</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Waist</Text>
              <TextInput
                style={styles.input}
                value={metrics.waist_cm}
                onChangeText={(text) => setMetrics({...metrics, waist_cm: text})}
                keyboardType="number-pad"
                placeholder="80"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Chest</Text>
              <TextInput
                style={styles.input}
                value={metrics.chest_cm}
                onChangeText={(text) => setMetrics({...metrics, chest_cm: text})}
                keyboardType="number-pad"
                placeholder="100"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hip</Text>
              <TextInput
                style={styles.input}
                value={metrics.hip_cm}
                onChangeText={(text) => setMetrics({...metrics, hip_cm: text})}
                keyboardType="number-pad"
                placeholder="95"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Arm</Text>
              <TextInput
                style={styles.input}
                value={metrics.arm_cm}
                onChangeText={(text) => setMetrics({...metrics, arm_cm: text})}
                keyboardType="number-pad"
                placeholder="35"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Thigh</Text>
              <TextInput
                style={styles.input}
                value={metrics.thigh_cm}
                onChangeText={(text) => setMetrics({...metrics, thigh_cm: text})}
                keyboardType="number-pad"
                placeholder="55"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupTitle}>Vital Signs</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Resting HR</Text>
              <TextInput
                style={styles.input}
                value={metrics.resting_heart_rate}
                onChangeText={(text) => setMetrics({...metrics, resting_heart_rate: text})}
                keyboardType="number-pad"
                placeholder="65"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>BP Systolic</Text>
              <TextInput
                style={styles.input}
                value={metrics.blood_pressure_systolic}
                onChangeText={(text) => setMetrics({...metrics, blood_pressure_systolic: text})}
                keyboardType="number-pad"
                placeholder="120"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>BP Diastolic</Text>
              <TextInput
                style={styles.input}
                value={metrics.blood_pressure_diastolic}
                onChangeText={(text) => setMetrics({...metrics, blood_pressure_diastolic: text})}
                keyboardType="number-pad"
                placeholder="80"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={metrics.notes}
            onChangeText={(text) => setMetrics({...metrics, notes: text})}
            placeholder="Any observations or notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveMetrics}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Metrics'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent History */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {history.slice(0, 5).map((entry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(entry.log_date).toLocaleDateString()}
              </Text>
              <View style={styles.historyMetrics}>
                {entry.weight_kg && (
                  <View style={styles.historyMetric}>
                    <Text style={styles.historyValue}>{entry.weight_kg} kg</Text>
                    {index < history.length - 1 && history[index + 1].weight_kg && 
                      renderTrend(entry.weight_kg, history[index + 1].weight_kg)
                    }
                  </View>
                )}
                {entry.body_fat_percentage && (
                  <View style={styles.historyMetric}>
                    <Text style={styles.historyValue}>{entry.body_fat_percentage}%</Text>
                    {index < history.length - 1 && history[index + 1].body_fat_percentage && 
                      renderTrend(entry.body_fat_percentage, history[index + 1].body_fat_percentage)
                    }
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: '#6366f1',
  },
  metricButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricButtonTextActive: {
    color: '#fff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  analysisCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  analysisLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  analysisValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  analysisCategory: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  recommendations: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  form: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  historyMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});
