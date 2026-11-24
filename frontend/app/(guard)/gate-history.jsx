import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { LogOut, LogIn } from 'lucide-react-native';

export default function GuardGateHistory() {
  const router = useRouter();
  const { activities } = useApp();

  // Filter only gate exit and gate return activities
  const gateActivities = activities.filter(
    (a) => a.type === 'GATE_EXIT' || a.type === 'GATE_RETURN'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filterOptions = [
    { label: 'All Gate Movements', value: 'ALL', count: gateActivities.length },
    {
      label: 'Exits',
      value: 'GATE_EXIT',
      count: gateActivities.filter((a) => a.type === 'GATE_EXIT').length,
    },
    {
      label: 'Returns',
      value: 'GATE_RETURN',
      count: gateActivities.filter((a) => a.type === 'GATE_RETURN').length,
    },
  ];

  const filteredLogs = useMemo(() => {
    return gateActivities.filter((act) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        act.studentName.toLowerCase().includes(q) ||
        act.enrollmentNo.toLowerCase().includes(q) ||
        act.roomNo.toLowerCase().includes(q);

      const matchesType = filterType === 'ALL' || act.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [gateActivities, searchQuery, filterType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gate Movements Log"
        subtitle={`${gateActivities.length} Check-ins & Check-outs`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by student name or roll..."
        />
      </View>

      <FilterChips
        options={filterOptions}
        selected={filterType}
        onSelect={setFilterType}
        style={{ marginBottom: 6 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const isExit = log.type === 'GATE_EXIT';
            const Icon = isExit ? LogOut : LogIn;

            return (
              <View key={log.id} style={styles.card}>
                <View
                  style={[
                    styles.iconCircle,
                    isExit
                      ? { backgroundColor: '#FEF3C7' }
                      : { backgroundColor: '#DCFCE7' },
                  ]}
                >
                  <Icon size={18} color={isExit ? '#B45309' : '#15803D'} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{log.title}</Text>
                    <Text style={styles.cardTime}>{log.timestamp}</Text>
                  </View>
                  <Text style={styles.studentText}>
                    {log.studentName} ({log.enrollmentNo}) • Room {log.roomNo}
                  </Text>
                  <Text style={styles.descText}>{log.description}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            title="No Gate Logs Found"
            description="No entry or exit logs match your current search."
          />
        )}
      </ScrollView>

      <RoleTabBar role="guard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  studentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 3,
  },
  descText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
