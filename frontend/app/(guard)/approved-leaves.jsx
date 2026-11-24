import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../components/common/SearchBar';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { Calendar, MapPin, UserCheck, ArrowRight } from 'lucide-react-native';

export default function GuardApprovedLeaves() {
  const router = useRouter();
  const { leaveRequests, students } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // IMPORTANT: Show ONLY parent-approved requests eligible for gate clearance
  const approvedEligible = leaveRequests.filter(
    (r) =>
      (r.status === LEAVE_STATUS.PARENT_APPROVED ||
        r.status === LEAVE_STATUS.WARDEN_APPROVED) &&
      !r.actualExitTime
  );

  const filtered = approvedEligible.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.enrollmentNo.toLowerCase().includes(q) ||
      r.roomNo.toLowerCase().includes(q) ||
      r.destinationCity.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Authorized Gate Passes"
        subtitle={`${approvedEligible.length} Eligible for Exit`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search authorized student name, roll..."
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map((req) => {
            const student = students.find((s) => s.id === req.studentId);
            return (
              <View key={req.id} style={styles.card}>
                <View style={styles.topRow}>
                  <ProfileAvatar
                    uri={student?.avatar}
                    name={req.studentName}
                    size={46}
                  />
                  <View style={styles.infoCol}>
                    <Text style={styles.name}>{req.studentName}</Text>
                    <Text style={styles.sub}>
                      {req.enrollmentNo} • Room {req.roomNo}
                    </Text>
                  </View>
                  <StatusBadge status={req.status} size="small" />
                </View>

                <Text style={styles.reason}>{req.reason}</Text>

                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Calendar size={13} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.metaText}>
                      {req.departureDate} ➔ {req.expectedReturnDate}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <MapPin size={13} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {req.destinationCity}
                    </Text>
                  </View>
                </View>

                {/* Parent Approval Verification Pill */}
                <View style={styles.parentPill}>
                  <UserCheck size={14} color="#15803D" style={{ marginRight: 5 }} />
                  <Text style={styles.parentPillText}>
                    Parent Verified: {student?.parentName || 'Parent'}
                  </Text>
                </View>

                {/* Action button to proceed directly to gate exit */}
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(guard)/gate-exit',
                      params: { selectedId: req.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearBtnText}>Proceed to Gate Exit</Text>
                  <ArrowRight size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <EmptyState
            title="No Eligible Gate Passes"
            description="There are currently no students with authorized gate passes waiting for exit."
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  reason: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  metaBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  parentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  parentPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  clearBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
