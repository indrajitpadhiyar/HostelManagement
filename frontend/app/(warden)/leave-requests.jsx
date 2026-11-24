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

export default function WardenLeaveRequests() {
  const router = useRouter();
  const { leaveRequests } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filterOptions = [
    { label: 'All', value: 'ALL', count: leaveRequests.length },
    {
      label: 'Parent Approved (Ready)',
      value: 'PARENT_APPROVED',
      count: leaveRequests.filter((r) => r.status === LEAVE_STATUS.PARENT_APPROVED).length,
    },
    {
      label: 'Pending Parent',
      value: 'PENDING_PARENT',
      count: leaveRequests.filter((r) => r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL).length,
    },
    {
      label: 'Warden Cleared',
      value: 'WARDEN_APPROVED',
      count: leaveRequests.filter((r) => r.status === LEAVE_STATUS.WARDEN_APPROVED).length,
    },
    {
      label: 'Checked Out',
      value: 'CHECKED_OUT',
      count: leaveRequests.filter((r) => r.status === LEAVE_STATUS.CHECKED_OUT).length,
    },
    {
      label: 'Checked In',
      value: 'CHECKED_IN',
      count: leaveRequests.filter((r) => r.status === LEAVE_STATUS.CHECKED_IN).length,
    },
    {
      label: 'Rejected',
      value: 'REJECTED',
      count: leaveRequests.filter(
        (r) => r.status === LEAVE_STATUS.REJECTED || r.status === LEAVE_STATUS.PARENT_REJECTED
      ).length,
    },
  ];

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        req.studentName.toLowerCase().includes(q) ||
        req.enrollmentNo.toLowerCase().includes(q) ||
        req.roomNo.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'PARENT_APPROVED') {
        matchesStatus = req.status === LEAVE_STATUS.PARENT_APPROVED;
      } else if (statusFilter === 'PENDING_PARENT') {
        matchesStatus = req.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL;
      } else if (statusFilter === 'WARDEN_APPROVED') {
        matchesStatus = req.status === LEAVE_STATUS.WARDEN_APPROVED;
      } else if (statusFilter === 'CHECKED_OUT') {
        matchesStatus = req.status === LEAVE_STATUS.CHECKED_OUT;
      } else if (statusFilter === 'CHECKED_IN') {
        matchesStatus = req.status === LEAVE_STATUS.CHECKED_IN;
      } else if (statusFilter === 'REJECTED') {
        matchesStatus =
          req.status === LEAVE_STATUS.REJECTED || req.status === LEAVE_STATUS.PARENT_REJECTED;
      }

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, searchQuery, statusFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gate Pass Clearance"
        subtitle={`${leaveRequests.length} Total Applications`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by student name, roll, or room..."
        />
      </View>

      <FilterChips
        options={filterOptions}
        selected={statusFilter}
        onSelect={setStatusFilter}
        style={{ marginBottom: 6 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <LeaveRequestCard
              key={req.id}
              request={req}
              onPress={() =>
                router.push({
                  pathname: '/(warden)/leave-details',
                  params: { id: req.id },
                })
              }
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title="No Gate Passes Found"
            description="No applications matching your selected filter criteria."
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
