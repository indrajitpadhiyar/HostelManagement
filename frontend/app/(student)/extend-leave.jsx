import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import CustomInput from '../../components/forms/CustomInput';
import DatePickerModal from '../../components/forms/DatePickerModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';
import PrimaryButton from '../../components/common/PrimaryButton';
import { Calendar, Clock, AlertCircle } from 'lucide-react-native';

export default function ExtendLeave() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { leaveRequests, submitLeaveExtension } = useApp();

  const request = leaveRequests.find((r) => r.id === id || r._id === id);

  const [newReturnDate, setNewReturnDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Extend Leave"
          showBack={true}
          onBack={() => router.replace('/(student)/leave-history')}
        />
        <View style={{ flex: 1, padding: 20 }}>
          <EmptyState
            title="Leave Pass Not Found"
            description="The requested leave pass does not exist or is no longer active."
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleValidateAndConfirm = () => {
    if (!newReturnDate) {
      setError('Please select a valid new return date.');
      return;
    }
    if (newReturnDate <= request.expectedReturnDate) {
      setError('New return date must be strictly after the current expected return date.');
      return;
    }
    if (!extensionReason.trim()) {
      setError('Please provide a reason for the extension.');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    submitLeaveExtension(request.id, newReturnDate, extensionReason);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Extend Leave"
        subtitle={request.id}
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Request Return Extension</Text>
          <Text style={styles.subtitle}>
            Extension requests will be routed to your parent for approval before updating warden records.
          </Text>

          {/* Current Return Date Info */}
          <View style={styles.currentBox}>
            <Text style={styles.currentLabel}>CURRENT EXPECTED RETURN</Text>
            <Text style={styles.currentValue}>{request.expectedReturnDate}</Text>
          </View>

          {/* New Return Date Selector */}
          <Text style={styles.fieldLabel}>Requested New Return Date *</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.datePickerSub}>NEW RETURN DATE</Text>
              <Text style={styles.datePickerVal}>{newReturnDate}</Text>
            </View>
          </TouchableOpacity>

          <CustomInput
            label="Reason for Extension *"
            placeholder="e.g. Travel delayed / Medical advice / Train rescheduled"
            value={extensionReason}
            onChangeText={setExtensionReason}
            multiline
            numberOfLines={3}
          />

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={15} color={COLORS.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            title="Submit Extension Request"
            onPress={handleValidateAndConfirm}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setNewReturnDate}
        initialDate={newReturnDate}
        minDate={request.expectedReturnDate}
        title="Select New Return Date"
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Extension?"
        message={`Confirm extending return date from ${request.expectedReturnDate} to ${newReturnDate}? Sent to your parent for approval.`}
        confirmText="Confirm Request"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(student)/dashboard');
        }}
        title="Extension Submitted!"
        message="Your extension request has been sent to your parent. Upon parent approval, the new return date will be updated across the system."
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
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
    lineHeight: 18,
  },
  currentBox: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  datePickerBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  datePickerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  datePickerVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
    flex: 1,
  },
});
