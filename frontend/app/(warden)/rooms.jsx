import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import SuccessModal from '../../components/modals/SuccessModal';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { Building, Users, Bed, Check, Plus } from 'lucide-react-native';

export default function WardenRooms() {
  const router = useRouter();
  const { rooms, students, allocateRoom } = useApp();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const availableBeds = rooms.reduce((acc, r) => acc + r.available, 0);

  const handleOpenAllocate = (room) => {
    setSelectedRoom(room);
    setSelectedStudentId(students[0]?.id || null);
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = () => {
    if (selectedStudentId && selectedRoom) {
      allocateRoom(selectedStudentId, selectedRoom.roomNo);
      setShowAllocateModal(false);
      const student = students.find((s) => s.id === selectedStudentId);
      setSuccessMsg(`Allocated room ${selectedRoom.roomNo} to ${student?.name}.`);
      setShowSuccessModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Hostel Room Management"
        subtitle={`${rooms.length} Total Rooms • ${availableBeds} Free Beds`}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Occupancy Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{totalBeds}</Text>
            <Text style={styles.summaryLabel}>Total Beds</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: COLORS.primary }]}>
              {occupiedBeds}
            </Text>
            <Text style={styles.summaryLabel}>Occupied</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: COLORS.success }]}>
              {availableBeds}
            </Text>
            <Text style={styles.summaryLabel}>Vacant</Text>
          </View>
        </View>

        {/* Rooms List */}
        <Text style={styles.sectionHeader}>ROOM DIRECTORY</Text>

        {rooms.map((room) => {
          const roomStudents = students.filter((s) => (room.studentIds || []).includes(s.id));
          const isFull = room.available === 0;

          return (
            <View key={room.roomNo} style={styles.roomCard}>
              <View style={styles.roomTopRow}>
                <View style={styles.roomLeft}>
                  <View style={styles.roomBadge}>
                    <Building size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.roomNumberText}>{room.roomNo}</Text>
                  </View>
                  <Text style={styles.floorText}>
                    {room.block} • {room.floor}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    isFull ? styles.statusPillFull : styles.statusPillFree,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isFull ? { color: COLORS.danger } : { color: COLORS.success },
                    ]}
                  >
                    {isFull ? 'FULL' : `${room.available} VACANT`}
                  </Text>
                </View>
              </View>

              <Text style={styles.typeText}>{room.type}</Text>

              {/* Occupancy Bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(room.occupied / room.capacity) * 100}%`,
                      backgroundColor: isFull ? COLORS.danger : COLORS.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.capacityMeta}>
                Capacity: {room.capacity} | Occupied: {room.occupied}
              </Text>

              {/* Assigned Students */}
              <View style={styles.occupantsSection}>
                <Text style={styles.occupantsHeading}>Current Occupants:</Text>
                {roomStudents.length > 0 ? (
                  roomStudents.map((stu) => (
                    <TouchableOpacity
                      key={stu.id}
                      style={styles.occupantPill}
                      onPress={() =>
                        router.push({
                          pathname: '/(warden)/student-details',
                          params: { id: stu.id },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.occupantDot} />
                      <Text style={styles.occupantName}>{stu.name}</Text>
                      <Text style={styles.occupantRoll}>({stu.enrollmentNo})</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyRoomText}>No students currently allocated.</Text>
                )}
              </View>

              {!isFull && (
                <TouchableOpacity
                  style={styles.allocateBtn}
                  onPress={() => handleOpenAllocate(room)}
                  activeOpacity={0.7}
                >
                  <Plus size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.allocateBtnText}>Assign Student to Bed</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Allocation Modal */}
      <Modal
        visible={showAllocateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllocateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Allocate to {selectedRoom?.roomNo}</Text>
            <Text style={styles.modalSub}>Select student to assign into this room</Text>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {students.map((stu) => {
                const isSelected = selectedStudentId === stu.id;
                return (
                  <TouchableOpacity
                    key={stu.id}
                    style={[
                      styles.studentChoice,
                      isSelected && styles.studentChoiceActive,
                    ]}
                    onPress={() => setSelectedStudentId(stu.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.studentChoiceName,
                          isSelected && { color: COLORS.primary },
                        ]}
                      >
                        {stu.name}
                      </Text>
                      <Text style={styles.studentChoiceSub}>
                        {stu.enrollmentNo} • Currently in {stu.roomNo}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setShowAllocateModal(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Confirm Allocation"
                onPress={handleConfirmAllocation}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Allocation Updated"
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  roomCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  roomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  floorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillFull: {
    backgroundColor: COLORS.dangerSubtle,
  },
  statusPillFree: {
    backgroundColor: COLORS.successSubtle,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  typeText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacityMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  occupantsSection: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
  },
  occupantsHeading: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  occupantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  occupantDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  occupantName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  occupantRoll: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  emptyRoomText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  allocateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primarySubtle,
  },
  allocateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 14,
    marginTop: 2,
  },
  studentChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentChoiceActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  studentChoiceName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  studentChoiceSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
