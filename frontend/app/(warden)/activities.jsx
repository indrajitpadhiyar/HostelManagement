import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import FilterChips from '../../components/common/FilterChips';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';

export default function WardenActivities() {
  const router = useRouter();
  const { activities } = useApp();

  const [filterType, setFilterType] = useState('ALL');

  const filterOptions = [
    { label: 'All Activities', value: 'ALL', count: activities.length },
    {
      label: 'Exits',
      value: 'GATE_EXIT',
      count: activities.filter((a) => a.type === 'GATE_EXIT').length,
    },
    {
      label: 'Returns',
      value: 'GATE_RETURN',
      count: activities.filter((a) => a.type === 'GATE_RETURN').length,
    },
    {
      label: 'Parent Approvals',
      value: 'PARENT_APPROVED',
      count: activities.filter((a) => a.type === 'PARENT_APPROVED').length,
    },
    {
      label: 'Extensions',
      value: 'EXTENSION_REQUESTED',
      count: activities.filter((a) => a.type === 'EXTENSION_REQUESTED').length,
    },
  ];

  const filteredActivities = useMemo(() => {
    if (filterType === 'ALL') return activities;
    return activities.filter((a) => a.type === filterType);
  }, [activities, filterType]);

  const getDotColor = (type) => {
    switch (type) {
      case 'GATE_EXIT':
        return COLORS.warning;
      case 'GATE_RETURN':
        return COLORS.success;
      case 'PARENT_APPROVED':
      case 'WARDEN_APPROVED':
        return COLORS.primary;
      case 'PARENT_REJECTED':
      case 'WARDEN_REJECTED':
        return COLORS.danger;
      case 'EXTENSION_REQUESTED':
        return '#C2410C';
      default:
        return COLORS.primary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Live Hostel Feed"
        subtitle={`${activities.length} Recorded Movements`}
        showBack={true}
        onBack={() => router.back()}
      />

      <FilterChips
        options={filterOptions}
        selected={filterType}
        onSelect={setFilterType}
        style={{ paddingVertical: 10 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act) => (
            <View key={act.id} style={styles.card}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: getDotColor(act.type) },
                ]}
              />
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={styles.title}>{act.title}</Text>
                  <Text style={styles.time}>{act.timestamp}</Text>
                </View>

                <Text style={styles.studentInfo}>
                  {act.studentName} • Room {act.roomNo}
                </Text>

                <Text style={styles.description}>{act.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="No Activities"
            description="No movement logs recorded for this category."
          />
        )}
      </ScrollView>

      <RoleTabBar role="warden" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  studentInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});
