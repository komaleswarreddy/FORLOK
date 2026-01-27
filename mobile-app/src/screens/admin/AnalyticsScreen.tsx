import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, Rect, Line, Polyline, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Car,
  KeyRound,
  Clock,
  Search,
  Filter,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants/theme';
import { Card } from '@components/common/Card';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [selectedRevenuePoint, setSelectedRevenuePoint] = useState<number | null>(null);
  const [selectedUserPoint, setSelectedUserPoint] = useState<number | null>(null);

  const metrics = {
    newUsers: { value: 234, change: '+12%' },
    revenue: { value: '₹1.2M', change: '+15%' },
    trips: { value: 1234, change: '+8%' },
  };

  const stats = {
    newUsers: 234,
    revenue: 1200000,
    trips: 1234,
    carPooling: 45,
    bikePooling: 12,
    carRentals: 35,
    bikeRentals: 8,
  };

  const serviceDistribution = {
    carPooling: 45,
    bikePooling: 12,
    carRentals: 35,
    bikeRentals: 8,
  };

  const topRoutes = [
    { route: 'Bangalore → Mumbai', trips: 1234 },
    { route: 'Delhi → Jaipur', trips: 890 },
    { route: 'Pune → Mumbai', trips: 567 },
  ];

  const topEarners = [
    { name: 'Rajesh K.', earnings: '₹12,500' },
    { name: 'Priya M.', earnings: '₹10,200' },
    { name: 'ABC Cars', earnings: '₹45,000' },
  ];

  // Chart data
  const revenueData = [
    { month: 'Jan', value: 850000 },
    { month: 'Feb', value: 920000 },
    { month: 'Mar', value: 780000 },
    { month: 'Apr', value: 1100000 },
    { month: 'May', value: 1250000 },
    { month: 'Jun', value: 1200000 },
  ];

  const userGrowthData = [
    { month: 'Jan', value: 1200 },
    { month: 'Feb', value: 1450 },
    { month: 'Mar', value: 1800 },
    { month: 'Apr', value: 2100 },
    { month: 'May', value: 2500 },
    { month: 'Jun', value: 2800 },
  ];

  const pieChartColors = [
    '#3B82F6', // Blue - Car Pooling
    '#10B981', // Green - Bike Pooling
    '#F59E0B', // Orange - Car Rentals
    '#EF4444', // Red - Bike Rentals
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.value));
  const maxUsers = Math.max(...userGrowthData.map(d => d.value));
  const chartWidth = width - SPACING.md * 2; // Increased width
  const chartHeight = 340; // Increased height for better label visibility
  const barWidth = 30; // Fixed thin bar width
  const chartPadding = { top: 20, right: 30, bottom: 60, left: 50 }; // Increased bottom padding for month labels
  const chartAreaWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartAreaHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.analytics.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <BarChart3 size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Download size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Background with Statistics Cards */}
        <View style={styles.imageContainer}>
          <ImageBackground
            source={require('../../../assets/history iamge.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <BlurView intensity={50} style={styles.blurContainer}>
              <View style={styles.statsContainer}>
                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+12%</Text>
                  </View>
                  <View style={styles.statIconContainer}>
                    <Users size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.newUsers}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>New Users</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+15%</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <DollarSign size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>₹{(stats.revenue / 100000).toFixed(1)}L</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Revenue</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statTrendTopRight}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={styles.statTrendText}>+8%</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '30' }]}>
                    <Car size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.trips.toLocaleString()}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Trips</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.warning + '30' }]}>
                    <Car size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.carPooling}%</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Car Pooling</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '30' }]}>
                    <KeyRound size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.carRentals}%</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Car Rentals</Text>
                  </View>
                </Card>

                <Card style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '30' }]}>
                    <Clock size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue} numberOfLines={1}>{stats.bikePooling}%</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>Bike Pooling</Text>
                  </View>
                </Card>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        <View style={styles.dateRangeContainer}>
          <Text style={styles.dateRangeLabel}>{t('admin.analytics.dateRange')}:</Text>
          <TouchableOpacity style={styles.dateRangeButton}>
            <Text style={styles.dateRangeText}>{dateRange}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.customRangeButton}>
            <Text style={styles.customRangeText}>{t('admin.analytics.customRange')}</Text>
          </TouchableOpacity>
        </View>

        {/* Service Distribution - Pie Chart */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('admin.analytics.serviceDistribution')}</Text>
          <View style={styles.pieChartContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {(() => {
                const centerX = 100;
                const centerY = 100;
                const radius = 80;
                let currentAngle = -Math.PI / 2; // Start from top
                const total = serviceDistribution.carPooling + serviceDistribution.bikePooling + serviceDistribution.carRentals + serviceDistribution.bikeRentals;
                
                const createSector = (percentage: number, color: string, index: number) => {
                  const angle = (percentage / total) * 2 * Math.PI;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  const x1 = centerX + radius * Math.cos(startAngle);
                  const y1 = centerY + radius * Math.sin(startAngle);
                  const x2 = centerX + radius * Math.cos(endAngle);
                  const y2 = centerY + radius * Math.sin(endAngle);
                  
                  const largeArcFlag = angle > Math.PI ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  currentAngle = endAngle;
                  
                  return (
                    <Path
                      key={index}
                      d={pathData}
                      fill={color}
                      stroke={COLORS.white}
                      strokeWidth="2"
                    />
                  );
                };
                
                return (
                  <>
                    {createSector(serviceDistribution.carPooling, pieChartColors[0], 0)}
                    {createSector(serviceDistribution.bikePooling, pieChartColors[1], 1)}
                    {createSector(serviceDistribution.carRentals, pieChartColors[2], 2)}
                    {createSector(serviceDistribution.bikeRentals, pieChartColors[3], 3)}
                    <Circle cx={centerX} cy={centerY} r="50" fill={COLORS.white} />
                    <SvgText x={centerX} y={centerY - 5} fontSize="16" fontWeight="bold" textAnchor="middle" fill={COLORS.primary}>
                      Total
                    </SvgText>
                    <SvgText x={centerX} y={centerY + 15} fontSize="14" textAnchor="middle" fill={COLORS.textSecondary}>
                      100%
                    </SvgText>
                  </>
                );
              })()}
            </Svg>
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: pieChartColors[0] }]} />
              <Text style={styles.legendText}>Car Pooling ({serviceDistribution.carPooling}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: pieChartColors[1] }]} />
              <Text style={styles.legendText}>Bike Pooling ({serviceDistribution.bikePooling}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: pieChartColors[2] }]} />
              <Text style={styles.legendText}>Car Rentals ({serviceDistribution.carRentals}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: pieChartColors[3] }]} />
              <Text style={styles.legendText}>Bike Rentals ({serviceDistribution.bikeRentals}%)</Text>
            </View>
          </View>
        </Card>

        {/* Top Performing Routes */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top Performing Routes</Text>
          {topRoutes.map((item, index) => (
            <View key={index} style={styles.routeItem}>
              <Text style={styles.routeRank}>{index + 1}.</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{item.route}</Text>
                <Text style={styles.routeTrips}>{item.trips.toLocaleString()} {t('admin.analytics.trips')}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Top Earning Users */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top Earning Users</Text>
          {topEarners.map((user, index) => (
            <View key={index} style={styles.earnerItem}>
              <Text style={styles.earnerRank}>{index + 1}.</Text>
              <View style={styles.earnerInfo}>
                <Text style={styles.earnerName}>{user.name}</Text>
                <Text style={styles.earnerEarnings}>- {user.earnings}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Revenue Trends - Area Chart */}
        <Card style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>{t('admin.analytics.revenueTrends')}</Text>
            <Text style={styles.chartSubtitle}>{t('admin.analytics.last6Months')}</Text>
          </View>
          <View style={styles.chartContainer}>
            <Pressable
              onPress={() => setSelectedRevenuePoint(null)}
              style={StyleSheet.absoluteFill}
            >
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  {/* Gradient for area fill */}
                  <LinearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <Stop offset="50%" stopColor="#34D399" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                  </LinearGradient>
                  {/* Gradient for line */}
                  <LinearGradient id="revenueLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#34D399" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
              
              {/* Y-axis line */}
              <Line
                x1={chartPadding.left}
                y1={chartPadding.top}
                x2={chartPadding.left}
                y2={chartHeight - chartPadding.bottom}
                stroke={COLORS.border}
                strokeWidth="2"
              />
              
              {/* X-axis line */}
              <Line
                x1={chartPadding.left}
                y1={chartHeight - chartPadding.bottom}
                x2={chartWidth - chartPadding.right}
                y2={chartHeight - chartPadding.bottom}
                stroke={COLORS.border}
                strokeWidth="2"
              />
              
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const yPos = chartPadding.top + (chartAreaHeight / 4) * i;
                return (
                  <Line
                    key={i}
                    x1={chartPadding.left}
                    y1={yPos}
                    x2={chartWidth - chartPadding.right}
                    y2={yPos}
                    stroke={COLORS.border}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.3"
                  />
                );
              })}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = maxRevenue - (maxRevenue / 4) * i;
                const yPos = chartPadding.top + (chartAreaHeight / 4) * i;
                let displayValue = '';
                if (value >= 1000000) {
                  displayValue = `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 100000) {
                  displayValue = `${(value / 100000).toFixed(1)}L`;
                } else {
                  displayValue = `${(value / 1000).toFixed(0)}K`;
                }
                return (
                  <SvgText
                    key={i}
                    x={chartPadding.left - 8}
                    y={yPos + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill={COLORS.textSecondary}
                    fontWeight="500"
                  >
                    {displayValue}
                  </SvgText>
                );
              })}
              
              {/* Y-axis title */}
              <SvgText
                x="15"
                y={chartHeight / 2}
                fontSize="11"
                textAnchor="middle"
                fill={COLORS.textSecondary}
                fontWeight="600"
                transform={`rotate(-90, 15, ${chartHeight / 2})`}
              >
                Revenue (₹)
              </SvgText>
              
              {/* Area fill under line */}
              <Path
                d={`M ${chartPadding.left},${chartHeight - chartPadding.bottom} ${revenueData
                  .map(
                    (item, index) =>
                      `L ${chartPadding.left + (index * chartAreaWidth) / (revenueData.length - 1)},${chartHeight - chartPadding.bottom - (item.value / maxRevenue) * chartAreaHeight}`
                  )
                  .join(' ')} L ${chartWidth - chartPadding.right},${chartHeight - chartPadding.bottom} Z`}
                fill="url(#revenueAreaGradient)"
              />
              
              {/* Main revenue line */}
              <Polyline
                points={revenueData
                  .map(
                    (item, index) =>
                      `${chartPadding.left + (index * chartAreaWidth) / (revenueData.length - 1)},${chartHeight - chartPadding.bottom - (item.value / maxRevenue) * chartAreaHeight}`
                  )
                  .join(' ')}
                fill="none"
                stroke="url(#revenueLineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points with glow effect */}
              {revenueData.map((item, index) => {
                const x = chartPadding.left + (index * chartAreaWidth) / (revenueData.length - 1);
                const y = chartHeight - chartPadding.bottom - (item.value / maxRevenue) * chartAreaHeight;
                const isSelected = selectedRevenuePoint === index;
                let displayValue = '';
                if (item.value >= 1000000) {
                  displayValue = `${(item.value / 1000000).toFixed(1)}M`;
                } else if (item.value >= 100000) {
                  displayValue = `${(item.value / 100000).toFixed(1)}L`;
                } else {
                  displayValue = `${(item.value / 1000).toFixed(0)}K`;
                }
                return (
                  <G key={index}>
                    {/* Outer glow - larger when selected */}
                    <Circle cx={x} cy={y} r={isSelected ? "12" : "8"} fill="#10B981" opacity={isSelected ? "0.4" : "0.3"} />
                    {/* Middle ring */}
                    <Circle cx={x} cy={y} r={isSelected ? "8" : "6"} fill="#10B981" opacity={isSelected ? "0.6" : "0.5"} />
                    {/* Inner circle */}
                    <Circle cx={x} cy={y} r={isSelected ? "7" : "5"} fill="#FFFFFF" stroke="#10B981" strokeWidth={isSelected ? "4" : "3"} />
                    {/* Value label - only show when selected (tooltip style inside chart) */}
                    {isSelected && (
                      <G>
                        {/* Background for label - positioned below point */}
                        <Rect
                          x={x - 30}
                          y={y + 15}
                          width="60"
                          height="22"
                          rx="4"
                          fill="#10B981"
                          opacity="0.95"
                        />
                        {/* Arrow pointing up */}
                        <Path
                          d={`M ${x} ${y + 15} L ${x - 6} ${y + 8} L ${x + 6} ${y + 8} Z`}
                          fill="#10B981"
                          opacity="0.95"
                        />
                        <SvgText
                          x={x}
                          y={y + 30}
                          fontSize="11"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontWeight="700"
                        >
                          {displayValue}
                        </SvgText>
                      </G>
                    )}
                    {/* Month label */}
                    <SvgText
                      x={x}
                      y={chartHeight - chartPadding.bottom + 25}
                      fontSize="12"
                      textAnchor="middle"
                      fill={COLORS.text}
                      fontWeight="600"
                    >
                      {item.month}
                    </SvgText>
                  </G>
                );
              })}
              
              {/* X-axis title */}
              <SvgText
                x={chartWidth / 2}
                y={chartHeight - 5}
                fontSize="11"
                textAnchor="middle"
                fill={COLORS.textSecondary}
                fontWeight="600"
              >
                Months
              </SvgText>
            </Svg>
            {/* Touchable overlays for data points */}
            {revenueData.map((item, index) => {
              const x = chartPadding.left + (index * chartAreaWidth) / (revenueData.length - 1);
              const y = chartHeight - chartPadding.bottom - (item.value / maxRevenue) * chartAreaHeight;
              return (
                <TouchableOpacity
                  key={`touch-${index}`}
                  style={[
                    styles.dataPointTouchable,
                    {
                      left: x - 20,
                      top: y - 20,
                    },
                  ]}
                  onPress={() => {
                    setSelectedRevenuePoint(selectedRevenuePoint === index ? null : index);
                  }}
                  activeOpacity={0.7}
                />
              );
            })}
            </Pressable>
          </View>
        </Card>

        {/* User Growth - Line Chart */}
        <Card style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>{t('admin.analytics.userGrowth')}</Text>
            <Text style={styles.chartSubtitle}>{t('admin.analytics.last6Months')}</Text>
          </View>
          <View style={styles.chartContainer}>
            <Pressable
              onPress={() => setSelectedUserPoint(null)}
              style={StyleSheet.absoluteFill}
            >
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                  </LinearGradient>
                  <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#60A5FA" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
              
              {/* Y-axis line */}
              <Line
                x1={chartPadding.left}
                y1={chartPadding.top}
                x2={chartPadding.left}
                y2={chartHeight - chartPadding.bottom}
                stroke={COLORS.border}
                strokeWidth="2"
              />
              
              {/* X-axis line */}
              <Line
                x1={chartPadding.left}
                y1={chartHeight - chartPadding.bottom}
                x2={chartWidth - chartPadding.right}
                y2={chartHeight - chartPadding.bottom}
                stroke={COLORS.border}
                strokeWidth="2"
              />
              
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const yPos = chartPadding.top + (chartAreaHeight / 4) * i;
                return (
                  <Line
                    key={i}
                    x1={chartPadding.left}
                    y1={yPos}
                    x2={chartWidth - chartPadding.right}
                    y2={yPos}
                    stroke={COLORS.border}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.3"
                  />
                );
              })}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = Math.round(maxUsers - (maxUsers / 4) * i);
                const yPos = chartPadding.top + (chartAreaHeight / 4) * i;
                const displayValue = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;
                return (
                  <SvgText
                    key={i}
                    x={chartPadding.left - 8}
                    y={yPos + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill={COLORS.textSecondary}
                    fontWeight="500"
                  >
                    {displayValue}
                  </SvgText>
                );
              })}
              
              {/* Y-axis title */}
              <SvgText
                x="15"
                y={chartHeight / 2}
                fontSize="11"
                textAnchor="middle"
                fill={COLORS.textSecondary}
                fontWeight="600"
                transform={`rotate(-90, 15, ${chartHeight / 2})`}
              >
                Users
              </SvgText>
              
              {/* X-axis title */}
              <SvgText
                x={chartWidth / 2}
                y={chartHeight - 5}
                fontSize="11"
                textAnchor="middle"
                fill={COLORS.textSecondary}
                fontWeight="600"
              >
                Months
              </SvgText>
              
              {/* Area fill under line */}
              <Path
                d={`M ${chartPadding.left},${chartHeight - chartPadding.bottom} ${userGrowthData
                  .map(
                    (item, index) =>
                      `L ${chartPadding.left + (index * chartAreaWidth) / (userGrowthData.length - 1)},${chartHeight - chartPadding.bottom - (item.value / maxUsers) * chartAreaHeight}`
                  )
                  .join(' ')} L ${chartWidth - chartPadding.right},${chartHeight - chartPadding.bottom} Z`}
                fill="url(#areaGradient)"
              />
              
              {/* Main line */}
              <Polyline
                points={userGrowthData
                  .map(
                    (item, index) =>
                      `${chartPadding.left + (index * chartAreaWidth) / (userGrowthData.length - 1)},${chartHeight - chartPadding.bottom - (item.value / maxUsers) * chartAreaHeight}`
                  )
                  .join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
                {/* Data Points */}
                {userGrowthData.map((item, index) => {
                  const x = chartPadding.left + (index * chartAreaWidth) / (userGrowthData.length - 1);
                  const y = chartHeight - chartPadding.bottom - (item.value / maxUsers) * chartAreaHeight;
                  const isSelected = selectedUserPoint === index;
                  const displayValue = item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}K` : `${item.value}`;
                  return (
                    <G key={index}>
                      {/* Outer glow - larger when selected */}
                      <Circle cx={x} cy={y} r={isSelected ? "12" : "10"} fill="#3B82F6" opacity={isSelected ? "0.3" : "0.2"} />
                      {/* Inner circle */}
                      <Circle cx={x} cy={y} r={isSelected ? "7" : "6"} fill="#FFFFFF" stroke="#3B82F6" strokeWidth={isSelected ? "4" : "3"} />
                      {/* Value label - only show when selected (tooltip style inside chart) */}
                      {isSelected && (
                        <G>
                          {/* Background for label - positioned below point */}
                          <Rect
                            x={x - 25}
                            y={y + 15}
                            width="50"
                            height="22"
                            rx="4"
                            fill="#3B82F6"
                            opacity="0.95"
                          />
                          {/* Arrow pointing up */}
                          <Path
                            d={`M ${x} ${y + 15} L ${x - 6} ${y + 8} L ${x + 6} ${y + 8} Z`}
                            fill="#3B82F6"
                            opacity="0.95"
                          />
                          <SvgText
                            x={x}
                            y={y + 30}
                            fontSize="11"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontWeight="700"
                          >
                            {displayValue}
                          </SvgText>
                        </G>
                      )}
                      {/* Month label */}
                      <SvgText
                        x={x}
                        y={chartHeight - chartPadding.bottom + 25}
                        fontSize="12"
                        textAnchor="middle"
                        fill={COLORS.text}
                        fontWeight="600"
                      >
                        {item.month}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
              {/* Touchable overlays for data points */}
              {userGrowthData.map((item, index) => {
                const x = chartPadding.left + (index * chartAreaWidth) / (userGrowthData.length - 1);
                const y = chartHeight - chartPadding.bottom - (item.value / maxUsers) * chartAreaHeight;
                return (
                  <TouchableOpacity
                    key={`touch-${index}`}
                    style={[
                      styles.dataPointTouchable,
                      {
                        left: x - 20,
                        top: y - 20,
                      },
                    ]}
                    onPress={() => {
                      setSelectedUserPoint(selectedUserPoint === index ? null : index);
                    }}
                    activeOpacity={0.7}
                  />
                );
              })}
            </Pressable>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('admin.analytics.generateCustomReport')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('admin.analytics.exportAllData')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  imageContainer: {
    width: '100%',
    height: 420,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 25, 82, 0.75)',
  },
  blurContainer: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    height: 100,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
    backgroundColor: COLORS.white + '95',
    position: 'relative',
  },
  statTrendTopRight: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.white + 'CC',
  },
  statTrendText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  dateRangeLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  dateRangeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateRangeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  customRangeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  customRangeText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  distributionList: {
    marginBottom: SPACING.sm,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  distributionLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  distributionValue: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  chartContainer: {
    height: 340,
    marginTop: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pieChartContainer: {
    height: 200,
    marginTop: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routeRank: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    width: 24,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  routeTrips: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  earnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  earnerRank: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    width: 24,
  },
  earnerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earnerName: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  earnerEarnings: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: COLORS.lightGray + '40',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  chartPlaceholderText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  dataPointTouchable: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});

export default AnalyticsScreen;
