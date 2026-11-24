import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import CustomInput from '../../components/forms/CustomInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import AppHeader from '../../components/common/AppHeader';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Reset Password"
        showBack={true}
        showNotifications={false}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {!submitted ? (
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.description}>
              Enter your registered institute email or parent email address to receive password reset instructions.
            </Text>

            <CustomInput
              label="Registered Email"
              placeholder="e.g. student@hosteleasy.demo"
              value={email}
              onChangeText={setEmail}
              error={error}
              leftIcon={Mail}
              keyboardType="email-address"
            />

            <PrimaryButton
              title="Send Reset Instructions"
              onPress={handleSubmit}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={40} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Check Your Inbox</Text>
            <Text style={styles.description}>
              We have sent demo password reset instructions to{' '}
              <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>
                {email}
              </Text>.
            </Text>

            <PrimaryButton
              title="Return to Sign In"
              onPress={() => router.back()}
              style={styles.submitBtn}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.successSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
    height: 48,
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },
  backLinkText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
