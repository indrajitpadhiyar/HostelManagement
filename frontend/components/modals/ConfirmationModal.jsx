import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { AlertCircle } from 'lucide-react-native';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  requireReason = false,
  reasonPlaceholder = 'Please enter reason...',
  icon: Icon = AlertCircle,
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setReasonError('Reason is required to proceed');
      return;
    }
    onConfirm(reason);
    setReason('');
    setReasonError('');
    onClose();
  };

  const handleCancel = () => {
    setReason('');
    setReasonError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.92)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.topGloss} />

            <View
              style={[
                styles.iconWrapper,
                confirmVariant === 'danger'
                  ? { backgroundColor: COLORS.dangerSubtle, borderColor: 'rgba(239, 68, 68, 0.3)' }
                  : { backgroundColor: COLORS.primarySubtle, borderColor: 'rgba(37, 99, 235, 0.3)' },
              ]}
            >
              <Icon
                size={28}
                color={confirmVariant === 'danger' ? COLORS.danger : COLORS.primary}
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {requireReason && (
              <View style={styles.reasonContainer}>
                <TextInput
                  value={reason}
                  onChangeText={(t) => {
                    setReason(t);
                    if (t.trim()) setReasonError('');
                  }}
                  placeholder={reasonPlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[styles.reasonInput, reasonError && styles.reasonInputError]}
                />
                {reasonError ? (
                  <Text style={styles.reasonErrorText}>{reasonError}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.actionsRow}>
              <SecondaryButton
                title={cancelText}
                onPress={handleCancel}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title={confirmText}
                onPress={handleConfirm}
                variant={confirmVariant}
                style={{ flex: 1.2 }}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  card: {
    padding: 22,
    alignItems: 'center',
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  reasonContainer: {
    width: '100%',
    marginBottom: 18,
  },
  reasonInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    minHeight: 74,
    textAlignVertical: 'top',
  },
  reasonInputError: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
  },
  reasonErrorText: {
    fontSize: 11.5,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
});
