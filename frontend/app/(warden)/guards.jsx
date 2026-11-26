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
import CustomInput from '../../components/forms/CustomInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { Shield, Phone, Clock, UserCheck, Plus, Check } from 'lucide-react-native';

export default function WardenGuards() {
  const router = useRouter();
  const { guards, toggleGuardDuty, addGuard } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [guardName, setGuardName] = useState('');
  const [guardMobile, setGuardMobile] = useState('+91 98');
  const [gateNum, setGateNum] = useState('Main Gate 1');
  const [shift, setShift] = useState('Day Shift (06:00 AM - 02:00 PM)');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveGuard = () => {
    if (!guardName.trim()) return;
    addGuard({
      name: guardName,
      mobile: guardMobile,
      gateNumber: gateNum,
      shift,
    });
    setShowAddModal(false);
    setSuccessMsg(`Guard ${guardName} added to roster.`);
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Security Guard Roster"
        subtitle={`${guards.length} Gate Personnel`}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>ACTIVE GATE PERSONNEL</Text>

        {guards.length > 0 ? (
          guards.map((guard) => {
            const isOnDuty = guard.status === 'ON_DUTY';

            return (
              <View key={guard.id} style={styles.guardCard}>
                <View style={styles.guardTopRow}>
                  <ProfileAvatar
                    uri={guard.avatar}
                    name={guard.name}
                    size={50}
                    status={isOnDuty ? 'online' : null}
                  />
                  <View style={styles.guardText}>
                    <Text style={styles.guardName}>{guard.name}</Text>
                    <Text style={styles.gateText}>
                      {guard.gateNumber} • {guard.id}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.dutyToggle,
                      isOnDuty ? styles.dutyOn : styles.dutyOff,
                    ]}
                    onPress={() => toggleGuardDuty(guard.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dutyText,
                        isOnDuty ? { color: COLORS.successDark } : { color: COLORS.textMuted },
                      ]}
                    >
                      {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.guardDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailText}>{guard.shift}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailText}>{guard.mobile}</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            title="No Guards Registered"
            description="No gate personnel records currently registered in the database."
            actionTitle="Add Guard"
            onActionPress={() => setShowAddModal(true)}
          />
        )}
      </ScrollView>

      {/* Add Guard Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Security Guard</Text>
            <Text style={styles.modalSub}>Assign gate duty shift & contact details</Text>

            <CustomInput
              label="Guard Name *"
              placeholder="e.g. Ramesh Kumar"
              value={guardName}
              onChangeText={setGuardName}
            />

            <CustomInput
              label="Mobile Number"
              value={guardMobile}
              onChangeText={setGuardMobile}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Gate Assignment"
              value={gateNum}
              onChangeText={setGateNum}
            />

            <CustomInput
              label="Duty Shift"
              value={shift}
              onChangeText={setShift}
            />

            <View style={styles.modalActionsRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Save Guard"
                onPress={handleSaveGuard}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Roster Updated"
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
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  guardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  guardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardText: {
    flex: 1,
    marginLeft: 12,
  },
  guardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dutyToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dutyOn: {
    backgroundColor: COLORS.successSubtle,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  dutyOff: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dutyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guardDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
