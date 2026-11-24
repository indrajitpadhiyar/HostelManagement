import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import LeaveRequestCard from '../../components/cards/LeaveRequestCard';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';

export default function ParentHistory() {
  const router = useRouter();
  const { currentUser, students, leaveRequests } = useApp();

  const child = students.find((s) => s.id === currentUser?.studentId) || students[0];
  const childLeaves = leaveRequests.filter((r) => r.studentId === child.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filterOptions = [
    { label: 'All', value: 'ALL', count: childLeaves.length },
    {
      label: 'Approved',
      value: 'APPROVED',
      count: childLeaves.filter(
        (r) =>
          r.status === LEAVE_STATUS.PARENT_APPROVED ||
          r.status === LEAVE_STATUS.WARDEN_APPROVED ||
          r.status === LEAVE_STATUS.CHECKED_OUT ||
          r.status === LEAVE_STATUS.CHECKED_IN
      ).length,
    },
    {
      label: 'Rejected',
      value: 'REJECTED',
      count: childLeaves.filter((r) => r.status === LEAVE_STATUS.PARENT_REJECTED).length,
    },
  ];

  const filtered = useMemo(() => {
    return childLeaves.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.reason.toLowerCase().includes(q) ||
        item.destinationCity.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'APPROVED') {
        matchesStatus =
          item.status === LEAVE_STATUS.PARENT_APPROVED ||
          item.status === LEAVE_STATUS.WARDEN_APPROVED ||
          item.status === LEAVE_STATUS.CHECKED_OUT ||
          item.status === LEAVE_STATUS.CHECKED_IN;
      } else if (statusFilter === 'REJECTED') {
        matchesStatus = item.status === LEAVE_STATUS.PARENT_REJECTED;
      }

      return matchesSearch && matchesStatus;
    });
  }, [childLeaves, searchQuery, statusFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Leave Pass Records"
        subtitle={`History for ${child.name}`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by reason, destination or ID..."
        />
      </View>

      <FilterChips
        options={filterOptions}
        selected={statusFilter}
        onSelect={setStatusFilter}
        style={{ marginBottom: 8 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              onPress={() =>
                router.push({
                  pathname: '/(parent)/leave-details',
                  params: { id: req.id },
                })
              }
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title="No History Found"
            description="There are no past records matching your filter."
          />
        )}
      </ScrollView>

      <RoleTabBar role="parent" />
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
});
