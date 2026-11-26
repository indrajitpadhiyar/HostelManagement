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
import SuccessModal from '../../components/modals/SuccessModal';
import {
  Building2,
  Mail,
  Lock,
  User,
  Heart,
  Shield,
  ShieldCheck,
  Phone,
  BookOpen,
  Building,
  Check,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';

const ROLE_OPTIONS = [
  {
    id: ROLES.STUDENT,
    label: 'Student',
    title: 'Student Registration',
    sub: 'Create your digital profile to submit leave requests & monitor attendance',
    icon: User,
    color: '#2563EB',
    gradient: ['#2563EB', '#1D4ED8'],
    pillBg: 'rgba(219, 234, 254, 0.7)',
    borderColor: '#93C5FD',
  },
  {
    id: ROLES.PARENT,
    label: 'Parent',
    title: 'Parent Registration',
    sub: 'Register to review, authorize & track your child’s campus leaves',
    icon: Heart,
    color: '#E11D48',
    gradient: ['#E11D48', '#BE123C'],
    pillBg: 'rgba(254, 226, 226, 0.7)',
    borderColor: '#FCA5A5',
  },
  {
    id: ROLES.WARDEN,
    label: 'Warden',
    title: 'Warden Staff Account',
    sub: 'Register as hostel administration to manage gate passes & roll-calls',
    icon: Shield,
    color: '#059669',
    gradient: ['#059669', '#047857'],
    pillBg: 'rgba(209, 250, 229, 0.7)',
    borderColor: '#6EE7B7',
  },
  {
    id: ROLES.GUARD,
    label: 'Guard',
    title: 'Security Guard Terminal',
    sub: 'Register gate personnel for QR pass verification & campus logs',
    icon: ShieldCheck,
    color: '#D97706',
    gradient: ['#D97706', '#B45309'],
    pillBg: 'rgba(254, 243, 199, 0.7)',
    borderColor: '#FCD34D',
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useApp();

  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role-specific fields
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [department, setDepartment] = useState('');
  const [block, setBlock] = useState('');
  const [gateNumber, setGateNumber] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  const currentRoleCfg = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRegister = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }
    if (selectedRole === ROLES.STUDENT && !enrollmentNo.trim()) {
      setErrorMsg('Please enter your student enrollment number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the hostel terms and regulations.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      password,
      role: selectedRole,
      enrollmentNo: enrollmentNo.trim(),
      roomNo: roomNo.trim() || 'A-101',
      department: department.trim() || 'Computer Science & Engineering',
      block: block.trim() || 'Block A',
      gateNumber: gateNumber.trim() || 'Main Gate 1',
    });
    setLoading(false);

    if (res?.pendingApproval) {
      setPendingMessage(
        res.message ||
        'Your registration request has been submitted to the Warden for approval. Once accepted by the Warden, you will be able to sign in and access the student portal.'
      );
      setShowPendingModal(true);
      return;
    }

    if (!res.success) {
      setErrorMsg(res.message);
    }
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
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.topBarTitleWrapper}>
              <Text style={styles.topBarTitle}>New Registration</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Liquid Brand Header */}
          <View style={styles.brandContainer}>
            <LinearGradient
              colors={COLORS.gradients.liquidBlue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Building2 size={30} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Create Account</Text>
              <Sparkles size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.brandSubtitle}>
              Join the official HostelEase campus clearance network
            </Text>
          </View>

          {/* Role Selection Tabs */}
          <View style={styles.roleTabsContainer}>
            <Text style={styles.roleTabsTitle}>CHOOSE REGISTRATION ROLE</Text>
            <View style={styles.roleTabsRow}>
              {ROLE_OPTIONS.map((cfg) => {
                const isActive = selectedRole === cfg.id;
                const IconComp = cfg.icon;
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
                    onPress={() => {
                      setSelectedRole(cfg.id);
                      setErrorMsg('');
                    }}
                    activeOpacity={0.8}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={cfg.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.activeTabIconCircle}
                      >
                        <IconComp size={14} color="#FFFFFF" />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.inactiveTabIconCircle, { backgroundColor: cfg.pillBg }]}>
                        <IconComp size={14} color={cfg.color} />
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

          {/* Form Card */}
          <View style={styles.glassFormCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(240, 246, 255, 0.88)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassInner}
            >
              <View style={styles.topGloss} />

              {/* Dynamic Role Banner */}
              <View style={[styles.activeRoleBanner, { borderLeftColor: currentRoleCfg.color }]}>
                <Text style={[styles.activeRoleTitle, { color: currentRoleCfg.color }]}>
                  {currentRoleCfg.title}
                </Text>
                <Text style={styles.activeRoleSub}>{currentRoleCfg.sub}</Text>
              </View>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Full Name */}
              <CustomInput
                label="Full Name"
                placeholder="Enter full legal name"
                value={name}
                onChangeText={setName}
                leftIcon={User}
              />

              {/* Email */}
              <CustomInput
                label="Email Address"
                placeholder="e.g. yourname@domain.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={Mail}
              />

              {/* Mobile */}
              <CustomInput
                label="Mobile Phone Number"
                placeholder="e.g. +91 98765 43210"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                leftIcon={Phone}
              />

              {/* Role-Specific Fields: Student */}
              {selectedRole === ROLES.STUDENT && (
                <>
                  <CustomInput
                    label="Enrollment Number"
                    placeholder="e.g. EN2024001"
                    value={enrollmentNo}
                    onChangeText={setEnrollmentNo}
                    autoCapitalize="characters"
                    leftIcon={BookOpen}
                  />
                  <CustomInput
                    label="Hostel Room Number"
                    placeholder="e.g. A-204"
                    value={roomNo}
                    onChangeText={setRoomNo}
                    autoCapitalize="characters"
                    leftIcon={Building}
                  />
                  <CustomInput
                    label="Department / Course"
                    placeholder="e.g. Computer Science (B.Tech)"
                    value={department}
                    onChangeText={setDepartment}
                    leftIcon={Building2}
                  />
                </>
              )}

              {/* Role-Specific Fields: Warden */}
              {selectedRole === ROLES.WARDEN && (
                <CustomInput
                  label="Assigned Hostel Block"
                  placeholder="e.g. Block A & B (Chief Warden)"
                  value={block}
                  onChangeText={setBlock}
                  leftIcon={Building}
                />
              )}

              {/* Role-Specific Fields: Guard */}
              {selectedRole === ROLES.GUARD && (
                <CustomInput
                  label="Gate Terminal Assignment"
                  placeholder="e.g. Main Gate 1"
                  value={gateNumber}
                  onChangeText={setGateNumber}
                  leftIcon={ShieldCheck}
                />
              )}

              {/* Password */}
              <CustomInput
                label="Password"
                placeholder="Choose a secure password (min. 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={Lock}
              />

              {/* Confirm Password */}
              <CustomInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={Lock}
              />

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                  {agreeTerms && <Check size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the hostel safety guidelines, digital roll-call rules, and data privacy policy.
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <PrimaryButton
                title={`Create ${currentRoleCfg.label} Account`}
                onPress={handleRegister}
                loading={loading}
                style={styles.submitBtn}
              />

              {/* Sign In Link */}
              <View style={styles.loginPromptRow}>
                <Text style={styles.loginPromptText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.loginPromptLink, { color: currentRoleCfg.color }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showPendingModal}
        title="Registration Submitted! 📋"
        message={pendingMessage}
        buttonText="Go to Sign In"
        onClose={() => {
          setShowPendingModal(false);
          router.replace('/(auth)/login');
        }}
      />
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
    top: 200,
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
    paddingVertical: 16,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarTitleWrapper: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  activeRoleBanner: {
    borderLeftWidth: 3.5,
    paddingLeft: 10,
    marginBottom: 16,
  },
  activeRoleTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  activeRoleSub: {
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 14,
    paddingHorizontal: 2,
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
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  submitBtn: {
    height: 50,
  },
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.7)',
  },
  loginPromptText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loginPromptLink: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
