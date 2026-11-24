import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import { LEAVE_STATUS, HOSTEL_STATUS } from '../../constants/config';
import AppHeader from '../../components/common/AppHeader';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import { QrCode, Search, CheckCircle2, ArrowRight, ShieldCheck, X } from 'lucide-react-native';

export default function GuardVerifyStudent() {
  const router = useRouter();
  const { students, leaveRequests } = useApp();

  const [searchRoll, setSearchRoll] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  // Filter students matching the roll search
  const matchedStudents = searchRoll.trim()
    ? students.filter(
        (s) =>
          s.enrollmentNo.toLowerCase().includes(searchRoll.toLowerCase()) ||
          s.name.toLowerCase().includes(searchRoll.toLowerCase())
      )
    : [];

  const handleSelectStudent = (stu) => {
    // Find active leave or approved pass
    const activeLeave = leaveRequests.find(
      (r) =>
        r.studentId === stu.id &&
        (r.status === LEAVE_STATUS.CHECKED_OUT ||
          r.status === LEAVE_STATUS.WARDEN_APPROVED ||
          r.status === LEAVE_STATUS.PARENT_APPROVED)
    );

    setScannedResult({
      student: stu,
      leave: activeLeave,
    });
  };

  const handleSimulateScan = () => {
    // Pick the first student with approved pass for demonstration
    const demoReq = leaveRequests.find(
      (r) => r.status === LEAVE_STATUS.PARENT_APPROVED || r.status === LEAVE_STATUS.WARDEN_APPROVED
    ) || leaveRequests[0];
    const stu = students.find((s) => s.id === demoReq.studentId) || students[0];
    setSearchRoll(stu.enrollmentNo);
    handleSelectStudent(stu);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Student Verification"
        subtitle="QR Scanner & Manual Roll Verification"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual QR Scanner Viewfinder */}
        <View style={styles.viewfinderCard}>
          <View style={styles.scannerBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <View style={styles.scanBeam} />

            <QrCode size={64} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.scannerInstruction}>
              Align Digital Pass QR Code inside frame
            </Text>
          </View>

          <TouchableOpacity
            style={styles.simulateScanBtn}
            onPress={handleSimulateScan}
            activeOpacity={0.8}
          >
            <ShieldCheck size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.simulateScanText}>Simulate Instant QR Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Roll Number Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Manual Roll Number Lookup</Text>

          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={searchRoll}
              onChangeText={setSearchRoll}
              placeholder="Enter enrollment no. (e.g. EN2022001)"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              autoCapitalize="characters"
            />
            {searchRoll.length > 0 && (
              <TouchableOpacity onPress={() => setSearchRoll('')}>
                <X size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Autocomplete Suggestions */}
          {matchedStudents.length > 0 && !scannedResult && (
            <View style={styles.autocompleteList}>
              {matchedStudents.map((stu) => (
                <TouchableOpacity
                  key={stu.id}
                  style={styles.autoItem}
                  onPress={() => handleSelectStudent(stu)}
                  activeOpacity={0.7}
                >
                  <ProfileAvatar uri={stu.avatar} name={stu.name} size={36} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.autoName}>{stu.name}</Text>
                    <Text style={styles.autoSub}>
                      {stu.enrollmentNo} • Room {stu.roomNo}
                    </Text>
                  </View>
                  <ArrowRight size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Verification Result Card */}
        {scannedResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <CheckCircle2 size={22} color={COLORS.success} style={{ marginRight: 8 }} />
              <Text style={styles.resultHeaderTitle}>Identity Verified</Text>
            </View>

            <View style={styles.resultBody}>
              <ProfileAvatar
                uri={scannedResult.student.avatar}
                name={scannedResult.student.name}
                size={58}
                status={
                  scannedResult.student.hostelStatus === HOSTEL_STATUS.PRESENT
                    ? 'present'
                    : 'outside'
                }
              />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{scannedResult.student.name}</Text>
                <Text style={styles.resultRoll}>
                  {scannedResult.student.enrollmentNo} • {scannedResult.student.deptCode}
                </Text>
                <Text style={styles.resultRoom}>
                  Hostel Room: {scannedResult.student.roomNo}
                </Text>
              </View>
            </View>

            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerLabel}>Current Hostel Status:</Text>
              <StatusBadge
                status={scannedResult.student.hostelStatus}
                isHostelStatus={true}
                size="small"
              />
            </View>

            {scannedResult.leave ? (
              <View style={styles.leaveDetailsBox}>
                <Text style={styles.leavePassTitle}>
                  Active Gate Pass: {scannedResult.leave.reason}
                </Text>
                <Text style={styles.leaveDates}>
                  Schedule: {scannedResult.leave.departureDate} to {scannedResult.leave.expectedReturnDate}
                </Text>
                <Text style={styles.leaveDest}>
                  Destination: {scannedResult.leave.destinationCity}
                </Text>

                <View style={styles.actionButtonsRow}>
                  {scannedResult.student.hostelStatus === HOSTEL_STATUS.PRESENT ? (
                    <TouchableOpacity
                      style={[styles.gateActionBtn, { backgroundColor: '#B45309' }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(guard)/gate-exit',
                          params: { selectedId: scannedResult.leave.id },
                        })
                      }
                    >
                      <Text style={styles.gateActionBtnText}>Record Gate Exit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.gateActionBtn, { backgroundColor: COLORS.success }]}
                      onPress={() =>
                        router.push({
                          pathname: '/(guard)/gate-return',
                          params: { selectedId: scannedResult.leave.id },
                        })
                      }
                    >
                      <Text style={styles.gateActionBtnText}>Record Gate Return</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.noPassBox}>
                <Text style={styles.noPassText}>
                  ⚠️ No active or cleared gate pass found for this student.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <RoleTabBar role="guard" />
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
  viewfinderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  scannerBox: {
    width: 200,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
  },
  scanBeam: {
    position: 'absolute',
    top: 60,
    width: '90%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scannerInstruction: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 12,
  },
  simulateScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  simulateScanText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  autocompleteList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  autoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  autoName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  autoSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.success + '50',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  resultBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  resultRoll: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resultRoom: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusBannerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  leaveDetailsBox: {
    backgroundColor: COLORS.primarySubtle,
    borderRadius: 12,
    padding: 12,
  },
  leavePassTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  leaveDates: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  leaveDest: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionButtonsRow: {
    marginTop: 12,
  },
  gateActionBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noPassBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
  },
  noPassText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
});
