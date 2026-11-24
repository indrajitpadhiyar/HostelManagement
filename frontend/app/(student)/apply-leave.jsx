import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import CustomInput from '../../components/forms/CustomInput';
import DatePickerModal from '../../components/forms/DatePickerModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SuccessModal from '../../components/modals/SuccessModal';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import RoleTabBar from '../../components/navigation/RoleTabBar';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react-native';

export default function ApplyLeave() {
  const router = useRouter();
  const { currentUser, students, submitLeaveRequest } = useApp();

  const student = students.find((s) => s.id === currentUser?.id) || students[0];

  // Multi-step progress (1: Student Info, 2: Leave Info, 3: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form fields
  const [reason, setReason] = useState('');
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(student?.parentMobile || '');

  // Dates (dynamically starting from tomorrow)
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const returnObj = new Date(tomorrowObj);
  returnObj.setDate(returnObj.getDate() + 3);

  const [departureDate, setDepartureDate] = useState(tomorrowObj.toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(returnObj.toISOString().split('T')[0]);

  // Date picker modal state
  const [datePickerTarget, setDatePickerTarget] = useState(null); // 'departure' | 'return'
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep2 = () => {
    const errs = {};
    if (!reason.trim()) errs.reason = 'Reason is required';
    if (!destinationAddress.trim()) errs.destinationAddress = 'Destination address is required';
    if (!destinationCity.trim()) errs.destinationCity = 'Destination city is required';
    if (!emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required';
    if (!departureDate) errs.departureDate = 'Departure date is required';
    if (!expectedReturnDate) errs.expectedReturnDate = 'Return date is required';

    if (departureDate && expectedReturnDate && expectedReturnDate <= departureDate) {
      errs.expectedReturnDate = 'Return date must be strictly after departure date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    submitLeaveRequest({
      studentId: student.id,
      reason,
      detailedExplanation,
      destinationAddress,
      destinationCity,
      emergencyContact,
      departureDate,
      expectedReturnDate,
    });
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const openDatePicker = (target) => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const handleDateSelected = (dateStr) => {
    if (datePickerTarget === 'departure') {
      setDepartureDate(dateStr);
    } else if (datePickerTarget === 'return') {
      setExpectedReturnDate(dateStr);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Apply for Leave"
        subtitle={`Step ${currentStep} of 3`}
        showBack={true}
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          } else if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(student)/dashboard');
          }
        }}
      />

      {/* Stepper Bar */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperTrack}>
          <View
            style={[
              styles.stepperProgress,
              { width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' },
            ]}
          />
        </View>
        <View style={styles.stepperLabels}>
          <Text style={[styles.stepLabelText, currentStep >= 1 && styles.activeStepText]}>
            1. Student Info
          </Text>
          <Text style={[styles.stepLabelText, currentStep >= 2 && styles.activeStepText]}>
            2. Leave Details
          </Text>
          <Text style={[styles.stepLabelText, currentStep >= 3 && styles.activeStepText]}>
            3. Review & Submit
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: Student Information (Read-Only Verification) */}
          {currentStep === 1 && (
            <View style={styles.stepCard}>
              <Text style={styles.cardTitle}>Section 1: Student Verification</Text>
              <Text style={styles.cardSub}>
                Verify your institutional profile details attached to this application
              </Text>

              <CustomInput
                label="Enrollment Number"
                value={student.enrollmentNo}
                editable={false}
              />
              <CustomInput
                label="Student Full Name"
                value={student.name}
                editable={false}
              />
              <View style={styles.rowTwo}>
                <CustomInput
                  label="Department"
                  value={student.deptCode || 'CSE'}
                  editable={false}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <CustomInput
                  label="Semester"
                  value={student.semester}
                  editable={false}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={styles.rowTwo}>
                <CustomInput
                  label="Hostel Room"
                  value={student.roomNo}
                  editable={false}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <CustomInput
                  label="Registered Mobile"
                  value={student.mobile}
                  editable={false}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          {/* STEP 2: Leave Information */}
          {currentStep === 2 && (
            <View style={styles.stepCard}>
              <Text style={styles.cardTitle}>Section 2: Leave & Travel Details</Text>
              <Text style={styles.cardSub}>
                Provide clear travel schedule and verified emergency contacts
              </Text>

              <CustomInput
                label="Primary Reason for Leave *"
                placeholder="e.g. Sister Wedding / Medical / Hackathon"
                value={reason}
                onChangeText={setReason}
                error={errors.reason}
                leftIcon={FileText}
              />

              <CustomInput
                label="Detailed Explanation (Optional)"
                placeholder="Provide additional context for Warden & Parent"
                value={detailedExplanation}
                onChangeText={setDetailedExplanation}
                multiline
                numberOfLines={3}
              />

              {/* Date pickers */}
              <View style={styles.datePickerContainer}>
                <Text style={styles.fieldLabel}>Departure & Expected Return Date *</Text>
                <View style={styles.datePickersRow}>
                  <TouchableOpacity
                    style={[styles.dateTrigger, errors.departureDate && styles.dateTriggerError]}
                    onPress={() => openDatePicker('departure')}
                    activeOpacity={0.7}
                  >
                    <Calendar size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <View>
                      <Text style={styles.dateTriggerSub}>DEPARTURE</Text>
                      <Text style={styles.dateTriggerVal}>{departureDate}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateTrigger, errors.expectedReturnDate && styles.dateTriggerError]}
                    onPress={() => openDatePicker('return')}
                    activeOpacity={0.7}
                  >
                    <Calendar size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <View>
                      <Text style={styles.dateTriggerSub}>RETURN</Text>
                      <Text style={styles.dateTriggerVal}>{expectedReturnDate}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {errors.expectedReturnDate && (
                  <Text style={styles.errorText}>{errors.expectedReturnDate}</Text>
                )}
              </View>

              <CustomInput
                label="Destination Address *"
                placeholder="House / Building No., Street, Area"
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                error={errors.destinationAddress}
                leftIcon={MapPin}
              />

              <CustomInput
                label="Destination City & State *"
                placeholder="e.g. Jaipur, Rajasthan"
                value={destinationCity}
                onChangeText={setDestinationCity}
                error={errors.destinationCity}
              />

              <CustomInput
                label="Emergency Contact Number *"
                placeholder="Active mobile reachable during leave"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                error={errors.emergencyContact}
                keyboardType="phone-pad"
                leftIcon={Phone}
              />
            </View>
          )}

          {/* STEP 3: Review Summary */}
          {currentStep === 3 && (
            <View style={styles.stepCard}>
              <Text style={styles.cardTitle}>Section 3: Review Application</Text>
              <Text style={styles.cardSub}>
                Carefully review all details before submitting for parent approval
              </Text>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewHeading}>Applicant Information</Text>
                <Text style={styles.reviewLine}>
                  {student.name} ({student.enrollmentNo})
                </Text>
                <Text style={styles.reviewSubLine}>
                  {student.deptCode} • Room {student.roomNo}
                </Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewHeading}>Leave Schedule</Text>
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleBadge}>
                    <Text style={styles.scheduleBadgeLabel}>DEPARTURE</Text>
                    <Text style={styles.scheduleBadgeVal}>{departureDate}</Text>
                  </View>
                  <ArrowRight size={16} color={COLORS.textMuted} />
                  <View style={styles.scheduleBadge}>
                    <Text style={styles.scheduleBadgeLabel}>EXPECTED RETURN</Text>
                    <Text style={styles.scheduleBadgeVal}>{expectedReturnDate}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewHeading}>Reason</Text>
                <Text style={styles.reviewLine}>{reason}</Text>
                {detailedExplanation ? (
                  <Text style={styles.reviewSubLine}>{detailedExplanation}</Text>
                ) : null}
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewHeading}>Destination & Contact</Text>
                <Text style={styles.reviewLine}>{destinationAddress}</Text>
                <Text style={styles.reviewSubLine}>{destinationCity}</Text>
                <Text style={[styles.reviewSubLine, { marginTop: 4 }]}>
                  Emergency Contact: {emergencyContact}
                </Text>
              </View>

              <View style={styles.noticeBox}>
                <CheckCircle2 size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.noticeText}>
                  Upon submission, this request will be instantly delivered to your registered
                  parent ({student.parentName}) for digital authorization.
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsRow}>
            {currentStep > 1 && (
              <SecondaryButton
                title="Back"
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{ flex: 1, marginRight: 10 }}
              />
            )}
            <PrimaryButton
              title={currentStep === 3 ? 'Submit Leave Request' : 'Continue'}
              onPress={handleNext}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelected}
        initialDate={datePickerTarget === 'departure' ? departureDate : expectedReturnDate}
        minDate={datePickerTarget === 'return' ? departureDate : todayStr}
        title={datePickerTarget === 'departure' ? 'Select Departure Date' : 'Select Return Date'}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Leave Request?"
        message={`Are you sure you want to apply for leave from ${departureDate} to ${expectedReturnDate}? This will be sent to your parent for approval.`}
        confirmText="Yes, Submit"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(student)/leave-history');
        }}
        title="Leave Request Submitted!"
        message="Your request has been created with status PENDING_PARENT_APPROVAL. Your parent will receive an approval alert."
        buttonText="View Leave History"
      />

      <RoleTabBar role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepperContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stepperTrack: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepperProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  stepperLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeStepText: {
    color: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  rowTwo: {
    flexDirection: 'row',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  datePickersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTrigger: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dateTriggerError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FFF5F5',
  },
  dateTriggerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  dateTriggerVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  errorText: {
    fontSize: 11.5,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  reviewSection: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reviewLine: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewSubLine: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scheduleBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 110,
  },
  scheduleBadgeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  scheduleBadgeVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primarySubtle,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 17,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
