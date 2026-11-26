import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterChips from '../../components/common/FilterChips';
import StudentCard from '../../components/cards/StudentCard';
import CustomInput from '../../components/forms/CustomInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { UserPlus } from 'lucide-react-native';

export default function WardenStudents() {
  const router = useRouter();
  const { students, rooms, addStudent, deleteStudent, allocateRoom } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for Add Student
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newDeptCode, setNewDeptCode] = useState('CSE');
  const [newSem, setNewSem] = useState('6th Semester');
  const [newRoom, setNewRoom] = useState('A-110');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentMobile, setNewParentMobile] = useState('');
  const [formError, setFormError] = useState('');

  // Reallocate state
  const [selectedNewRoom, setSelectedNewRoom] = useState('A-204');

  const deptOptions = [
    { label: 'All Departments', value: 'ALL', count: students.length },
    { label: 'CSE', value: 'CSE', count: students.filter((s) => s.deptCode === 'CSE').length },
    { label: 'IT', value: 'IT', count: students.filter((s) => s.deptCode === 'IT').length },
    { label: 'ECE', value: 'ECE', count: students.filter((s) => s.deptCode === 'ECE').length },
    { label: 'MECH', value: 'MECH', count: students.filter((s) => s.deptCode === 'MECH').length },
    { label: 'CIVIL', value: 'CIVIL', count: students.filter((s) => s.deptCode === 'CIVIL').length },
  ];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.enrollmentNo.toLowerCase().includes(q) ||
        s.roomNo.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'ALL' || s.deptCode === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, deptFilter]);

  const handleOpenAdd = () => {
    const randomRoll = `EN2024${Math.floor(100 + Math.random() * 900)}`;
    setNewRoll(randomRoll);
    setNewName('');
    setNewEmail('');
    setNewMobile('+91 9');
    setNewParentName('');
    setNewParentMobile('+91 9');
    setFormError('');
    setShowAddModal(true);
  };

  const handleSaveAddStudent = () => {
    if (!newName.trim() || !newRoll.trim() || !newRoom.trim()) {
      setFormError('Name, Roll Number, and Room are required');
      return;
    }

    addStudent({
      enrollmentNo: newRoll,
      name: newName,
      department: newDept,
      deptCode: newDeptCode,
      semester: newSem,
      roomNo: newRoom,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@student.demo`,
      mobile: newMobile,
      parentName: newParentName || 'Parent / Guardian',
      parentMobile: newParentMobile,
    });

    setShowAddModal(false);
    setSuccessMsg(`Student ${newName} successfully enrolled into room ${newRoom}!`);
    setShowSuccessModal(true);
  };

  const handleOpenAllocate = (stu) => {
    setSelectedStudentForAction(stu);
    setSelectedNewRoom(stu.roomNo);
    setShowAllocateModal(true);
  };

  const handleConfirmReallocate = () => {
    if (selectedStudentForAction && selectedNewRoom) {
      allocateRoom(selectedStudentForAction.id, selectedNewRoom);
      setShowAllocateModal(false);
      setSuccessMsg(
        `Room reallocated to ${selectedNewRoom} for ${selectedStudentForAction.name}.`
      );
      setShowSuccessModal(true);
    }
  };

  const handleDeleteTrigger = (stu) => {
    setSelectedStudentForAction(stu);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStudentForAction) {
      deleteStudent(selectedStudentForAction.id);
      setShowDeleteConfirm(false);
      setSuccessMsg(`Record deleted for ${selectedStudentForAction.name}.`);
      setShowSuccessModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Student Management"
        subtitle={`${students.length} Registered Hostellers`}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleOpenAdd}
            activeOpacity={0.7}
          >
            <UserPlus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, roll, or room number..."
        />
      </View>

      <FilterChips
        options={deptOptions}
        selected={deptFilter}
        onSelect={setDeptFilter}
        style={{ marginBottom: 6 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((stu) => (
            <StudentCard
              key={stu.id}
              student={stu}
              showActions={true}
              onAllocateRoom={() => handleOpenAllocate(stu)}
              onPress={() =>
                router.push({
                  pathname: '/(warden)/student-details',
                  params: { id: stu.id },
                })
              }
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title={students.length === 0 ? "No Students Registered" : "No Students Found"}
            description={students.length === 0 ? "No students registered yet in the database. Tap Add New Student to register a hosteller." : "No student records matching your current filter criteria."}
            actionTitle="Add New Student"
            onActionPress={handleOpenAdd}
          />
        )}
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add New Student</Text>
              <Text style={styles.modalSub}>Enter student & room allocation records</Text>

              {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

              <CustomInput
                label="Student Full Name *"
                placeholder="e.g. Harshit Joshi"
                value={newName}
                onChangeText={setNewName}
              />

              <CustomInput
                label="Enrollment Roll Number *"
                placeholder="e.g. EN2024889"
                value={newRoll}
                onChangeText={setNewRoll}
              />

              <View style={styles.rowTwo}>
                <CustomInput
                  label="Department Code"
                  value={newDeptCode}
                  onChangeText={setNewDeptCode}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <CustomInput
                  label="Room Allocation *"
                  value={newRoom}
                  onChangeText={setNewRoom}
                  style={{ flex: 1 }}
                />
              </View>

              <CustomInput
                label="Student Mobile"
                value={newMobile}
                onChangeText={setNewMobile}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Parent Name"
                placeholder="Parent / Guardian Name"
                value={newParentName}
                onChangeText={setNewParentName}
              />

              <CustomInput
                label="Parent Mobile (Emergency)"
                value={newParentMobile}
                onChangeText={setNewParentMobile}
                keyboardType="phone-pad"
              />

              <View style={styles.modalActionsRow}>
                <SecondaryButton
                  title="Cancel"
                  onPress={() => setShowAddModal(false)}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  title="Save Student"
                  onPress={handleSaveAddStudent}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reallocate Room Modal */}
      <Modal
        visible={showAllocateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllocateModal(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Change Room Allocation</Text>
            <Text style={styles.dialogSub}>
              Assign new room for {selectedStudentForAction?.name}
            </Text>

            <View style={styles.roomSelectGrid}>
              {rooms.map((r) => (
                <TouchableOpacity
                  key={r.roomNo}
                  style={[
                    styles.roomSelectItem,
                    selectedNewRoom === r.roomNo && styles.roomSelectItemActive,
                  ]}
                  onPress={() => setSelectedNewRoom(r.roomNo)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roomSelectText,
                      selectedNewRoom === r.roomNo && styles.roomSelectTextActive,
                    ]}
                  >
                    {r.roomNo}
                  </Text>
                  <Text style={styles.roomSelectAvail}>
                    {r.available} bed{r.available === 1 ? '' : 's'} free
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setShowAllocateModal(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Confirm Change"
                onPress={handleConfirmReallocate}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record?"
        message={`Are you sure you want to remove ${selectedStudentForAction?.name} from hostel records? This will free up bed allocation.`}
        confirmText="Delete Record"
        confirmVariant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMsg}
      />

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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowTwo: {
    flexDirection: 'row',
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  formErrorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dialogSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  roomSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  roomSelectItem: {
    width: '30%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roomSelectItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  roomSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roomSelectTextActive: {
    color: COLORS.primary,
  },
  roomSelectAvail: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
