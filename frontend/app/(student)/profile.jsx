import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import CustomInput from '../../components/forms/CustomInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  User,
  Phone,
  Mail,
  Home,
  GraduationCap,
  Calendar,
  Heart,
  Droplet,
  Edit2,
  Award,
  BookOpen,
} from 'lucide-react-native';

export default function StudentProfile() {
  const router = useRouter();
  const { currentUser, students, updateStudentProfile } = useApp();

  const student = students.find((s) => s.id === currentUser?.id) || students[0];

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [mobile, setMobile] = useState(student.mobile);
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup || 'O+');
  const [parentMobile, setParentMobile] = useState(student.parentMobile);

  const handleSaveProfile = () => {
    updateStudentProfile(student.id, {
      mobile,
      bloodGroup,
      parentMobile,
    });
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Student Profile"
        subtitle={student.enrollmentNo}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Edit2 size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.editHeaderText}>Edit</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Profile Header Card */}
        <View style={styles.avatarCard}>
          <ProfileAvatar
            uri={student.avatar}
            name={student.name}
            size={76}
            status={student.hostelStatus === 'PRESENT_IN_HOSTEL' ? 'present' : 'outside'}
          />
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.enrollment}>{student.enrollmentNo}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.deptBadge}>
              <Text style={styles.deptText}>{student.department}</Text>
            </View>
          </View>
        </View>

        {/* Hostel & Academic Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hostel & Academic Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Home size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Room & Block</Text>
              <Text style={styles.infoValue}>
                {student.roomNo} ({student.block || 'Hostel Block A'})
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <GraduationCap size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Semester & Year</Text>
              <Text style={styles.infoValue}>{student.semester} (3rd Year)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Calendar size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Admission Date</Text>
              <Text style={styles.infoValue}>{student.admissionDate}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconCircle}>
              <Droplet size={15} color={COLORS.danger} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>{student.bloodGroup || 'O+'}</Text>
            </View>
          </View>
        </View>

        {/* Contact & Parent Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact & Parent Details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Phone size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Student Mobile</Text>
              <Text style={styles.infoValue}>{student.mobile}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Mail size={15} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Student Email</Text>
              <Text style={styles.infoValue}>{student.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Heart size={15} color="#DC2626" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Parent / Guardian Name</Text>
              <Text style={styles.infoValue}>{student.parentName}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconCircle}>
              <Phone size={15} color="#DC2626" />
            </View>
            <View style={styles.infoTextWrapper}>
              <Text style={styles.infoLabel}>Parent Emergency Contact</Text>
              <Text style={styles.infoValue}>{student.parentMobile}</Text>
            </View>
          </View>
        </View>

        {/* 5-Year Academic & Room History */}
        <View style={styles.sectionCard}>
          <View style={styles.historyHeader}>
            <Award size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>5-Year Academic & Room History</Text>
          </View>

          {student.academicHistory?.map((item, idx) => (
            <View key={idx} style={styles.historyItem}>
              <View style={styles.historyYearRow}>
                <Text style={styles.historyYear}>{item.year}</Text>
                <View style={styles.gpaBadge}>
                  <Text style={styles.gpaText}>GPA: {item.gpa}</Text>
                </View>
              </View>

              <View style={styles.historyDetailsRow}>
                <Text style={styles.historySub}>
                  {item.semester} • {item.department}
                </Text>
                <Text style={styles.historyRoom}>Room: {item.roomNo}</Text>
              </View>
              <Text style={styles.historyAttendance}>
                Attendance: {item.attendance}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal (Frontend Only) */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile (Frontend Only)</Text>
            <Text style={styles.modalSub}>
              Update student contact and emergency details
            </Text>

            <CustomInput
              label="Student Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Parent Emergency Number"
              value={parentMobile}
              onChangeText={setParentMobile}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Blood Group"
              value={bloodGroup}
              onChangeText={setBloodGroup}
            />

            <View style={styles.modalActionsRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setEditModalVisible(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Save Changes"
                onPress={handleSaveProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <RoleTabBar role="student" />
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
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editHeaderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  name: {
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
    marginTop: 8,
  },
  deptBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deptText: {
    fontSize: 12,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyYearRow: {
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
  gpaBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gpaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyRoom: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyAttendance: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
