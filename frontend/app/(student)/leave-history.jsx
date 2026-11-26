import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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

export default function LeaveHistory() {
  const router = useRouter();
  const { currentUser, students, leaveRequests } = useApp();

  const student =
    students.find((s) => s.id === currentUser?.id || s.id === currentUser?.studentId) ||
    currentUser ||
    {};
  const myLeaves = leaveRequests.filter((r) => r.studentId === student.id || r.studentId === student.studentId);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filterOptions = [
    { label: 'All Requests', value: 'ALL', count: myLeaves.length },
    {
      label: 'Pending',
      value: 'PENDING',
      count: myLeaves.filter(
        (r) =>
          r.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL ||
          r.status === LEAVE_STATUS.EXTENSION_PENDING
      ).length,
    },
    {
      label: 'Approved',
      value: 'APPROVED',
      count: myLeaves.filter(
        (r) =>
          r.status === LEAVE_STATUS.PARENT_APPROVED ||
          r.status === LEAVE_STATUS.WARDEN_APPROVED ||
          r.status === LEAVE_STATUS.EXTENSION_APPROVED
      ).length,
    },
    {
      label: 'Active / Outside',
      value: 'OUTSIDE',
      count: myLeaves.filter((r) => r.status === LEAVE_STATUS.CHECKED_OUT).length,
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
      count: myLeaves.filter((r) => r.status === LEAVE_STATUS.CHECKED_IN).length,
    },
  ];

  const filteredLeaves = useMemo(() => {
    return myLeaves.filter((item) => {
      // Search text match
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.reason.toLowerCase().includes(q) ||
        item.destinationCity.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'PENDING') {
        matchesStatus =
          item.status === LEAVE_STATUS.PENDING_PARENT_APPROVAL ||
          item.status === LEAVE_STATUS.EXTENSION_PENDING;
      } else if (statusFilter === 'APPROVED') {
        matchesStatus =
          item.status === LEAVE_STATUS.PARENT_APPROVED ||
          item.status === LEAVE_STATUS.WARDEN_APPROVED ||
          item.status === LEAVE_STATUS.EXTENSION_APPROVED;
      } else if (statusFilter === 'OUTSIDE') {
        matchesStatus = item.status === LEAVE_STATUS.CHECKED_OUT;
      } else if (statusFilter === 'COMPLETED') {
        matchesStatus = item.status === LEAVE_STATUS.CHECKED_IN;
      }

      return matchesSearch && matchesStatus;
    });
  }, [myLeaves, searchQuery, statusFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Leave History"
        subtitle={`${myLeaves.length} Total Applications`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by reason, city or pass ID..."
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
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((request) => (
            <LeaveRequestCard
              key={request.id}
              request={request}
              onPress={() =>
                router.push({
                  pathname: '/(student)/leave-details',
                  params: { id: request.id },
                })
              }
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title="No Leave Records Found"
            description="You don't have any leave requests matching the selected filter."
            actionTitle="Apply for Leave"
            onActionPress={() => router.push('/(student)/apply-leave')}
          />
        )}
      </ScrollView>

      <RoleTabBar role="student" />
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
