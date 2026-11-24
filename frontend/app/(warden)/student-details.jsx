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
} from 'lucide-react-native';

export default function WardenStudentDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, leaveRequests, deleteStudent } = useApp();

  const student = students.find((s) => s.id === id) || students[0];
  const studentLeaves = leaveRequests.filter((r) => r.studentId === student.id);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCall = (num) => {
    if (num) Linking.openURL(`tel:${num.replace(/\s+/g, '')}`);
  };

  const handleDelete = () => {
    deleteStudent(student.id);
    setShowDeleteModal(false);
    router.replace('/(warden)/students');
  };

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
});
