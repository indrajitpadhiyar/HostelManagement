import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { XCircle } from 'lucide-react-native';
import PrimaryButton from '../common/PrimaryButton';

export default function ErrorModal({
  visible,
  onClose,
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  buttonText = 'Close',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.98)', 'rgba(254, 242, 242, 0.92)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.topGloss} />

            <View style={styles.iconCircle}>
              <XCircle size={36} color={COLORS.danger} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <PrimaryButton
              title={buttonText}
              onPress={onClose}
              variant="danger"
              style={styles.button}
            />
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
    padding: 24,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(254, 202, 202, 0.8)',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  card: {
    padding: 24,
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
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(254, 226, 226, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 46,
  },
});
