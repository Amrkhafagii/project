import React from 'react';
import {
  View,
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, Clock, Filter, ArrowUp, ArrowDown, Package, DollarSign, FileText, Download, Share2 } from 'lucide-react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { menuIntelligenceEngine } from '@/services/restaurant/menuIntelligence';
import { Colors, Layout } from '@/constants';
import { Card } from '@/app/_components/common/Card';

const screenWidth = Dimensions.get('window').width;

export default function RestaurantAnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  
  // Helper function to get default start date
  function getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }
  
  // Helper function to get default end date
  function getDefaultEndDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  // Get chart data based on selected time range
  const getChartData = () => {
    switch(timeRange) {
      case 'week':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [350, 420, 380, 490, 550, 690, 520],
          }]
        };
      case 'month':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: [2100, 2450, 2800, 2350],
          }]
        };
      case 'quarter':
        return {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            data: [8200, 7800, 9100],
          }]
        };
      case 'year':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            data: [7500, 8200, 9100, 8700, 9200, 9800, 10500, 11200, 10700, 9800, 10200, 11500],
          }]
        };
      default:
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: [2100, 2450, 2800, 2350],
          }]
        };
    }
  };
  
  // Get order volume data
  const getOrderVolumeData = () => {
    switch(timeRange) {
      case 'week':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            data: [25, 32, 28, 36, 42, 55, 40],
          }]
        };
      case 'month':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: [168, 180, 205, 175],
          }]
        };
      case 'quarter':
        return {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            data: [640, 600, 710],
          }]
        };
      case 'year':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            data: [550, 600, 650, 700, 750, 800, 850, 900, 850, 800, 750, 800],
          }]
        };
      default:
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: [168, 180, 205, 175],
          }]
        };
    }
  };
  
  // Pie chart data for distribution analysis
  const distributionData = [
    { name: 'Online', value: 65, color: '#10B981', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'In-App', value: 25, color: '#3B82F6', legendFontColor: '#111827', legendFontSize: 12 },
    { name: 'Phone', value: 10, color: '#F59E0B', legendFontColor: '#111827', legendFontSize: 12 },
  ];
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };
  
  // Activity metrics data
  const getMetrics = () => {
    switch(timeRange) {
      case 'week':
        return {
          totalOrders: 245,
          totalRevenue: 4270.50,
          averageOrder: 17.43,
          topSellingItem: 'Grilled Salmon Power Bowl'
        };
      case 'month':
        return {
          totalOrders: 928,
          totalRevenue: 16430.75,
          averageOrder: 17.70,
          topSellingItem: 'Grilled Salmon Power Bowl'
        };
      case 'quarter':
        return {
          totalOrders: 2950,
          totalRevenue: 52360.20,
          averageOrder: 17.75,
          topSellingItem: 'Grilled Salmon Power Bowl'
        };
      case 'year':
        return {
          totalOrders: 10870,
          totalRevenue: 196230.50,
          averageOrder: 18.05,
          topSellingItem: 'Grilled Salmon Power Bowl'
        };
      default:
        return {
          totalOrders: 928,
          totalRevenue: 16430.75,
          averageOrder: 17.70,
          topSellingItem: 'Grilled Salmon Power Bowl'
        };
    }
  };
  
  const metrics = getMetrics();
  
  // Popular items data
  const popularItems = [
    { name: 'Grilled Salmon Power Bowl', sales: 120, revenue: 2279, percentage: 15 },
    { name: 'Lean Chicken Mediterranean', sales: 105, revenue: 1733, percentage: 13 },
    { name: 'Protein-Packed Quinoa Bowl', sales: 90, revenue: 1349, percentage: 11 },
    { name: 'Keto Power Plate', sales: 85, revenue: 1699, percentage: 10 },
    { name: 'Green Protein Smoothie', sales: 78, revenue: 1092, percentage: 8 },
  ];

  // Download report
  const handleDownloadReport = () => {
    // This would generate and download a report in a real app
    alert('Report downloaded successfully!');
  };

  // Handle date range change
  const handleDateRangeChange = () => {
    // This would apply the custom date range
    setShowDatePicker(false);
    alert(`Date range set: ${startDate} to ${endDate}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Actions */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics Dashboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadReport}
            >
              <Download size={18} color={Colors.textSecondary} />
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
            >
              <Share2 size={18} color={Colors.textSecondary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Report Type Selector */}
        <View style={styles.reportTypeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['sales', 'orders', 'items', 'customers', 'promotions'].map((report) => (
              <TouchableOpacity
                key={report}
                style={[
                  styles.reportTypeButton,
                  selectedReport === report && styles.selectedReportButton
                ]}
                onPress={() => setSelectedReport(report)}
              >
                <Text
                  style={[
                    styles.reportTypeText,
                    selectedReport === report && styles.selectedReportText
                  ]}
                >
                  {report.charAt(0).toUpperCase() + report.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeButtons}>
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.selectedTimeRangeButton
                ]}
                onPress={() => setTimeRange(range as any)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.selectedTimeRangeText
                  ]}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.customDateButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.customDateText}>Custom</Text>
            <ChevronDown 
              size={16} 
              color={Colors.primary} 
              style={{ transform: [{ rotate: showDatePicker ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>
        </View>
        
        {/* Custom Date Picker */}
        {showDatePicker && (
          <Card style={styles.datePickerContainer}>
            <View style={styles.dateInputsContainer}>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>End Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.applyDateButton}
              onPress={handleDateRangeChange}
            >
              <Text style={styles.applyDateButtonText}>Apply Range</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Package size={20} color={Colors.white} />
            </View>
            <Text style={styles.summaryValue}>{metrics.totalOrders}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: Colors.success }]}>
              <DollarSign size={20} color={Colors.white} />
            </View>
            <Text style={styles.summaryValue}>${metrics.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Revenue</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: Colors.info }]}>
              <Package size={20} color={Colors.white} />
            </View>
            <Text style={styles.summaryValue}>${metrics.averageOrder.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Avg. Order</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: Colors.warning }]}>
              <TrendingUp size={20} color={Colors.white} />
            </View>
            <Text style={styles.summaryValue}>
              <ArrowUp size={14} color={Colors.success} />
              12%
            </Text>
            <Text style={styles.summaryLabel}>Growth</Text>
          </Card>
        </View>

        {/* Sales Trend Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales Trend</Text>
            <View style={styles.chartActions}>
              <TouchableOpacity style={styles.chartActionButton}>
                <FileText size={16} color={Colors.textSecondary} />
                <Text style={styles.chartActionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              propsForDots: {
                r: '5',
                strokeWidth: '1',
                stroke: Colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
          
          <View style={styles.chartMeta}>
            <View style={styles.chartMetaItem}>
              <ArrowUp size={16} color={Colors.success} />
              <Text style={styles.chartMetaText}>
                <Text style={{ fontWeight: '600' }}>12% growth</Text> compared to previous {timeRange}
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Volume Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Order Volume</Text>
            <View style={styles.chartActions}>
              <TouchableOpacity style={styles.chartActionButton}>
                <FileText size={16} color={Colors.textSecondary} />
                <Text style={styles.chartActionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <BarChart
            data={getOrderVolumeData()}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card>

        {/* Distribution Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Order Source Distribution</Text>
          </View>
          
          <View style={styles.pieChartContainer}>
            <PieChart
              data={distributionData.map(item => ({
                name: item.name,
                population: item.value,
                color: item.color,
                legendFontColor: item.legendFontColor,
                legendFontSize: item.legendFontSize,
              }))}
              width={screenWidth - 40}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </View>
        </Card>

        {/* Popular Items */}
        <Card style={styles.popularItemsCard}>
          <Text style={styles.chartTitle}>Top Selling Items</Text>
          
          {popularItems.map((item, index) => (
            <View key={index} style={styles.popularItemRow}>
              <View style={styles.popularItemInfo}>
                <Text style={styles.popularItemRank}>{index + 1}</Text>
                <Text style={styles.popularItemName}>{item.name}</Text>
              </View>
              
              <View style={styles.popularItemMetrics}>
                <Text style={styles.popularItemSales}>{item.sales} orders</Text>
                <Text style={styles.popularItemRevenue}>${item.revenue}</Text>
                <View style={styles.popularItemPercentage}>
                  <View 
                    style={[
                      styles.popularItemPercentageFill, 
                      { width: `${item.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Items</Text>
          </TouchableOpacity>
        </Card>

        {/* Key Insights */}
        <Card style={styles.insightsCard}>
          <Text style={styles.chartTitle}>Key Insights</Text>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <TrendingUp size={20} color={Colors.success} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Peak Order Hours</Text>
              <Text style={styles.insightDescription}>
                Your busiest hours are between 12-2 PM and 6-8 PM. Consider optimizing kitchen staffing during these times.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <DollarSign size={20} color={Colors.primary} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Revenue Growth</Text>
              <Text style={styles.insightDescription}>
                Your revenue has increased by 15% compared to previous month, primarily driven by higher average order values.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Package size={20} color={Colors.info} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Menu Performance</Text>
              <Text style={styles.insightDescription}>
                Consider promoting your "Keto Power Plate" more as it has the highest profit margin among your popular items.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reportTypeContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  reportTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedReportButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reportTypeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedReportText: {
    color: Colors.white,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  selectedTimeRangeButton: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedTimeRangeText: {
    color: Colors.primary,
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  customDateText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  datePickerContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  applyDateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  applyDateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  chartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chartActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  chartActionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartMeta: {
    marginTop: 8,
  },
  chartMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  popularItemsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  popularItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  popularItemRank: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 24,
  },
  popularItemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginLeft: 8,
  },
  popularItemMetrics: {
    alignItems: 'flex-end',
  },
  popularItemSales: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  popularItemRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
    marginBottom: 4,
  },
  popularItemPercentage: {
    width: 80,
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  popularItemPercentageFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  viewAllButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  insightItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
