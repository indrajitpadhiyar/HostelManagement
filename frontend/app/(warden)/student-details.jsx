import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import LeaveRequestCard from '../../components/cards/LeaveRequestCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import {
  Home,
  Phone,
  Mail,
  Heart,
  Calendar,
  Award,
  GraduationCap,
  Trash2,
  Check,
  X,
  Sparkles,
} from 'lucide-react-native';

export default function WardenStudentDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, leaveRequests, deleteStudent, approveStudentRegistration, rejectStudentRegistration } = useApp();

  const student = students.find((s) => s.id === id || s._id === id);
  const studentLeaves = student ? leaveRequests.filter((r) => r.studentId === student.id || r.studentId === student._id) : [];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCall = (num) => {
    if (num) Linking.openURL(`tel:${num.replace(/\s+/g, '')}`);
  };

  const handleDelete = () => {
    if (student) {
      deleteStudent(student.id);
      setShowDeleteModal(false);
      router.replace('/(warden)/students');
    }
  };

  if (!student) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Student Record"
          subtitle="Not Found"
          showBack={true}
          onBack={() => router.replace('/(warden)/students')}
        />
        <View style={{ flex: 1, padding: 20 }}>
          <EmptyState
            title="Student Record Not Found"
            description="The requested student does not exist in the hostel database."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Student Record"
        subtitle={student.enrollmentNo}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.deleteHeaderBtn}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={COLORS.danger} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending Approval Banner */}
        {student.approvalStatus === 'PENDING' && (
          <View style={styles.pendingDetailsBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Sparkles size={16} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.pendingDetailsTitle}>Registration Awaiting Warden Approval</Text>
            </View>
            <Text style={styles.pendingDetailsSub}>
              This student has registered on the hostel system. Accept their request to activate their account and grant access to the student portal.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={styles.detailsApproveBtn}
                disabled={actionLoading}
                onPress={async () => {
                  setActionLoading(true);
                  try {
                    await approveStudentRegistration(student.id);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Check size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.detailsApproveBtnText}>Accept Request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailsRejectBtn}
                disabled={actionLoading}
                onPress={async () => {
                  setActionLoading(true);
                  try {
                    await rejectStudentRegistration(student.id);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <X size={15} color={COLORS.danger} style={{ marginRight: 4 }} />
                <Text style={styles.detailsRejectBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileCard}>
          <ProfileAvatar
            uri={student.avatar}
            name={student.name}
            size={68}
            status={student.hostelStatus === 'PRESENT_IN_HOSTEL' ? 'present' : 'outside'}
          />
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.enrollment}>{student.enrollmentNo}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge
              status={student.hostelStatus}
              isHostelStatus={true}
              size="small"
            />
            <View style={styles.deptBadge}>
              <Text style={styles.deptText}>{student.department}</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact & Residence</Text>

          <View style={styles.row}>
            <Home size={16} color={COLORS.primary} style={styles.rowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Room</Text>
              <Text style={styles.rowVal}>{student.roomNo} ({student.block})</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Phone size={16} color={COLORS.primary} style={styles.rowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Student Mobile</Text>
              <Text style={styles.rowVal}>{student.mobile}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(student.mobile)}
            >
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Heart size={16} color="#DC2626" style={styles.rowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Parent: {student.parentName}</Text>
              <Text style={styles.rowVal}>{student.parentMobile}</Text>
            </View>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() => handleCall(student.parentMobile)}
            >
              <Text style={[styles.callBtnText, { color: '#DC2626' }]}>Call Parent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5-Year Academic Record */}
        <View style={styles.sectionCard}>
          <View style={styles.secHeaderRow}>
            <Award size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>5-Year Academic & Room History</Text>
          </View>

          {student.academicHistory?.map((item, idx) => (
            <View key={idx} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <Text style={styles.historyYear}>{item.year}</Text>
                <View style={styles.gpaPill}>
                  <Text style={styles.gpaPillText}>GPA: {item.gpa}</Text>
                </View>
              </View>
              <Text style={styles.historySub}>
                {item.semester} • {item.department} • Room {item.roomNo}
              </Text>
              <Text style={styles.historyAtt}>Attendance: {item.attendance}</Text>
            </View>
          ))}
        </View>

        {/* Student Leave History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Leave Pass History ({studentLeaves.length})
          </Text>

          {studentLeaves.length > 0 ? (
            studentLeaves.map((req) => (
              <LeaveRequestCard
                key={req.id}
                request={req}
                onPress={() =>
                  router.push({
                    pathname: '/(warden)/leave-details',
                    params: { id: req.id },
                  })
                }
                style={{ marginBottom: 8 }}
              />
            ))
          ) : (
            <Text style={styles.noLeavesText}>No leave passes recorded.</Text>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Student Record?"
        message={`Confirm removing ${student.name} from hostel records? This will vacate bed in room ${student.roomNo}.`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
      />
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
  deleteHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.dangerSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  enrollment: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  deptBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deptText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowIcon: {
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  rowVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  callBtn: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  secHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyYear: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gpaPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyAtt: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  noLeavesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  pendingDetailsBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  pendingDetailsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#B45309',
  },
  pendingDetailsSub: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  detailsApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsApproveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsRejectBtn: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
  },
  detailsRejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
