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
  Zap,
} from 'lucide-react-native';

const ROLE_CONFIGS = {
  [ROLES.STUDENT]: {
    id: ROLES.STUDENT,
    label: 'Student',
    title: 'Student Portal',
    sub: 'Apply for leaves, check attendance & gate pass clearance',
    inputLabel: 'Student Roll No or Email',
    placeholder: 'e.g. EN2022001 or student@hosteleasy.demo',
    icon: User,
    color: '#2563EB',
    gradient: ['#2563EB', '#1D4ED8'],
    pillBg: 'rgba(219, 234, 254, 0.7)',
    borderColor: '#93C5FD',
    demoCred: 'EN2022001',
    demoPass: 'Password@123',
    demoName: 'Aarav Sharma (Room A-204)',
  },
  [ROLES.PARENT]: {
    id: ROLES.PARENT,
    label: 'Parent',
    title: 'Parent Portal',
    sub: 'Authorize or reject ward leaves & track movements',
    inputLabel: 'Registered Parent Mobile or Email',
    placeholder: 'e.g. 9876543211 or parent@hosteleasy.demo',
    icon: Heart,
    color: '#E11D48',
    gradient: ['#E11D48', '#BE123C'],
    pillBg: 'rgba(254, 226, 226, 0.7)',
    borderColor: '#FCA5A5',
    demoCred: 'parent@hosteleasy.demo',
    demoPass: 'Password@123',
    demoName: 'Rajesh Sharma',
  },
  [ROLES.WARDEN]: {
    id: ROLES.WARDEN,
    label: 'Warden',
    title: 'Chief Warden Portal',
    sub: 'Approve gate passes, log roll call & oversee hostel operations',
    inputLabel: 'Warden ID or Staff Email',
    placeholder: 'e.g. warden@hosteleasy.demo or Dr. Rameshwar',
    icon: Shield,
    color: '#059669',
    gradient: ['#059669', '#047857'],
    pillBg: 'rgba(209, 250, 229, 0.7)',
    borderColor: '#6EE7B7',
    demoCred: 'warden@hosteleasy.demo',
    demoPass: 'Password@123',
    demoName: 'Dr. Rameshwar Upadhyay',
  },
  [ROLES.GUARD]: {
    id: ROLES.GUARD,
    label: 'Guard',
    title: 'Gate Security Terminal',
    sub: 'Verify student QR passes, log departures & campus check-ins',
    inputLabel: 'Guard Security ID or Email',
    placeholder: 'e.g. guard@hosteleasy.demo or GRD001',
    icon: ShieldCheck,
    color: '#D97706',
    gradient: ['#D97706', '#B45309'],
    pillBg: 'rgba(254, 243, 199, 0.7)',
    borderColor: '#FCD34D',
    demoCred: 'guard@hosteleasy.demo',
    demoPass: 'Password@123',
    demoName: 'Balwant Singh (Main Gate 1)',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login, switchDemoRole } = useApp();

  const [activeRole, setActiveRole] = useState(ROLES.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentConfig = ROLE_CONFIGS[activeRole];

  const handleRoleTabChange = (role) => {
    setActiveRole(role);
    setErrorMsg('');
  };

  const handleLogin = async () => {
    setErrorMsg('');
    const inputId = email.trim();
    if (!inputId) {
      setErrorMsg(`Please enter your ${currentConfig.inputLabel.toLowerCase()}.`);
      return;
    }

    setLoading(true);
    const res = await login(inputId, password, activeRole);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleAutoFill = () => {
    setEmail(currentConfig.demoCred);
    setPassword(currentConfig.demoPass);
    setErrorMsg('');
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
              Smart Hostel Clearance & Multi-Tier Management
            </Text>
          </View>

          {/* Interactive Role Selector Bar */}
          <View style={styles.roleTabsContainer}>
            <Text style={styles.roleTabsTitle}>SELECT YOUR PORTAL</Text>
            <View style={styles.roleTabsRow}>
              {Object.values(ROLE_CONFIGS).map((cfg) => {
                const isActive = activeRole === cfg.id;
                const IconComponent = cfg.icon;
                return (
                  <TouchableOpacity
                    key={cfg.id}
                    style={[
                      styles.roleTab,
                      isActive && {
                        backgroundColor: '#FFFFFF',
                        borderColor: cfg.borderColor,
                        shadowColor: cfg.color,
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        elevation: 4,
                      },
                    ]}
                    onPress={() => handleRoleTabChange(cfg.id)}
                    activeOpacity={0.8}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={cfg.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.activeTabIconCircle}
                      >
                        <IconComponent size={14} color="#FFFFFF" />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.inactiveTabIconCircle, { backgroundColor: cfg.pillBg }]}>
                        <IconComponent size={14} color={cfg.color} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.roleTabText,
                        isActive && { color: cfg.color, fontWeight: '800' },
                      ]}
                    >
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Frosted Liquid Glass Login Card */}
          <View style={styles.glassFormCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.88)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassInner}
            >
              <View style={styles.topGloss} />

              {/* Dynamic Active Portal Banner */}
              <View style={[styles.activePortalHeader, { borderLeftColor: currentConfig.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activePortalTitle, { color: currentConfig.color }]}>
                    {currentConfig.title}
                  </Text>
                  <Text style={styles.activePortalSub}>{currentConfig.sub}</Text>
                </View>
              </View>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Input: Identifier */}
              <CustomInput
                label={currentConfig.inputLabel}
                placeholder={currentConfig.placeholder}
                value={email}
                onChangeText={setEmail}
                leftIcon={currentConfig.icon}
                autoCapitalize="none"
              />

              {/* Input: Password */}
              <CustomInput
                label="Password"
                placeholder="Enter your account password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={Lock}
              />

              {/* 1-Tap Auto Fill Helper Pill */}
              <TouchableOpacity
                style={[styles.autoFillPill, { borderColor: currentConfig.borderColor }]}
                onPress={handleAutoFill}
                activeOpacity={0.7}
              >
                <Zap size={13} color={currentConfig.color} style={{ marginRight: 6 }} />
                <Text style={styles.autoFillText}>
                  Quick Fill: <Text style={{ fontWeight: '700', color: currentConfig.color }}>{currentConfig.demoCred}</Text>
                </Text>
              </TouchableOpacity>

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

              {/* Primary Sign In Button */}
              <PrimaryButton
                title={`Sign In to ${currentConfig.label} Portal`}
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </LinearGradient>
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
    paddingVertical: 20,
    paddingBottom: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'center',
  },
  roleTabsContainer: {
    marginBottom: 12,
  },
  roleTabsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  activeTabIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  inactiveTabIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    marginBottom: 20,
  },
  glassInner: {
    padding: 20,
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
  activePortalHeader: {
    borderLeftWidth: 3.5,
    paddingLeft: 10,
    marginBottom: 16,
  },
  activePortalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  activePortalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  autoFillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  autoFillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
});
