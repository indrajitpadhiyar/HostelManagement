import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { ROLES } from '../../constants/config';
import { useApp } from '../../hooks/useApp';
import CustomInput from '../../components/forms/CustomInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import {
  Building2,
  Mail,
  Lock,
  User,
  Heart,
  Shield,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, switchDemoRole } = useApp();

  const [email, setEmail] = useState('student@hosteleasy.demo');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleQuickRole = async (role) => {
    setErrorMsg('');
    setLoading(true);
    await switchDemoRole(role);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Liquid Ambient Background Blobs */}
      <View pointerEvents="none" style={styles.ambientContainer}>
        <View style={styles.ambientOrb1} />
        <View style={styles.ambientOrb2} />
        <View style={styles.ambientOrb3} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Liquid Brand Header */}
          <View style={styles.brandContainer}>
            <LinearGradient
              colors={COLORS.gradients.liquidBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <View style={styles.logoGloss} />
              <Building2 size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>HostelEase</Text>
              <Sparkles size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.brandSubtitle}>
              Smart Hostel & Student Leave Management
            </Text>
          </View>

          {/* Frosted Liquid Glass Login Card */}
          <View style={styles.glassFormCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 246, 255, 0.82)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassInner}
            >
              <View style={styles.topGloss} />

              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSub}>
                Sign in with your registered credentials
              </Text>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              <CustomInput
                label="Email or Mobile"
                placeholder="e.g. student@hosteleasy.demo"
                value={email}
                onChangeText={setEmail}
                leftIcon={Mail}
                keyboardType="email-address"
              />

              <CustomInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={Lock}
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <PrimaryButton
                title="Sign In to Dashboard"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </LinearGradient>
          </View>

          {/* Liquid Glass 1-Tap Quick Demo Role Selector */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeaderRow}>
              <View style={styles.demoDivider} />
              <Text style={styles.demoHeaderTitle}>1-TAP DEMO ROLES</Text>
              <View style={styles.demoDivider} />
            </View>
            <Text style={styles.demoHeaderSub}>
              Switch between all four roles instantly with persistent state
            </Text>

            <View style={styles.roleGrid}>
              {/* Student */}
              <TouchableOpacity
                style={[styles.roleCard, email.includes('student') && styles.roleCardActive]}
                onPress={() => handleQuickRole(ROLES.STUDENT)}
                activeOpacity={0.75}
              >
                <View style={styles.roleCardGloss} />
                <LinearGradient
                  colors={['rgba(219, 234, 254, 0.9)', 'rgba(191, 219, 254, 0.6)']}
                  style={styles.roleIconCircle}
                >
                  <User size={20} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.roleName}>Student</Text>
                <Text style={styles.roleDetail}>Aarav Sharma (A-204)</Text>
              </TouchableOpacity>

              {/* Parent */}
              <TouchableOpacity
                style={[styles.roleCard, email.includes('parent') && styles.roleCardActive]}
                onPress={() => handleQuickRole(ROLES.PARENT)}
                activeOpacity={0.75}
              >
                <View style={styles.roleCardGloss} />
                <LinearGradient
                  colors={['rgba(254, 226, 226, 0.9)', 'rgba(254, 202, 202, 0.6)']}
                  style={styles.roleIconCircle}
                >
                  <Heart size={20} color="#DC2626" />
                </LinearGradient>
                <Text style={styles.roleName}>Parent</Text>
                <Text style={styles.roleDetail}>Rajesh Sharma</Text>
              </TouchableOpacity>

              {/* Warden */}
              <TouchableOpacity
                style={[styles.roleCard, email.includes('warden') && styles.roleCardActive]}
                onPress={() => handleQuickRole(ROLES.WARDEN)}
                activeOpacity={0.75}
              >
                <View style={styles.roleCardGloss} />
                <LinearGradient
                  colors={['rgba(209, 250, 229, 0.9)', 'rgba(167, 243, 208, 0.6)']}
                  style={styles.roleIconCircle}
                >
                  <Shield size={20} color="#059669" />
                </LinearGradient>
                <Text style={styles.roleName}>Warden</Text>
                <Text style={styles.roleDetail}>Dr. Rameshwar U.</Text>
              </TouchableOpacity>

              {/* Guard */}
              <TouchableOpacity
                style={[styles.roleCard, email.includes('guard') && styles.roleCardActive]}
                onPress={() => handleQuickRole(ROLES.GUARD)}
                activeOpacity={0.75}
              >
                <View style={styles.roleCardGloss} />
                <LinearGradient
                  colors={['rgba(254, 243, 199, 0.9)', 'rgba(253, 230, 138, 0.6)']}
                  style={styles.roleIconCircle}
                >
                  <ShieldCheck size={20} color="#D97706" />
                </LinearGradient>
                <Text style={styles.roleName}>Security Guard</Text>
                <Text style={styles.roleDetail}>Balwant Singh (Gate 1)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  ambientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientOrb1: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(191, 219, 254, 0.45)',
  },
  ambientOrb2: {
    position: 'absolute',
    top: 180,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(224, 231, 255, 0.5)',
  },
  ambientOrb3: {
    position: 'absolute',
    bottom: -80,
    left: 40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(219, 234, 254, 0.35)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  logoGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  glassFormCard: {
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 22,
  },
  glassInner: {
    padding: 22,
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
  welcomeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 18,
  },
  errorBanner: {
    backgroundColor: 'rgba(254, 226, 226, 0.85)',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: 12.5,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  loginButton: {
    height: 50,
  },
  demoSection: {
    marginTop: 2,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.6)',
  },
  demoHeaderTitle: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  demoHeaderSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(239, 246, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
  },
  roleCardGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  roleName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roleDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
});
