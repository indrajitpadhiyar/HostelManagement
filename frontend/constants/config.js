export const ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  WARDEN: 'warden',
  GUARD: 'guard',
};

export const LEAVE_STATUS = {
  PENDING_PARENT_APPROVAL: 'PENDING_PARENT_APPROVAL',
  PARENT_APPROVED: 'PARENT_APPROVED',
  PARENT_REJECTED: 'PARENT_REJECTED',
  PENDING_GATE_CLEARANCE: 'PENDING_GATE_CLEARANCE',
  WARDEN_APPROVED: 'WARDEN_APPROVED',
  GUARD_APPROVED: 'GUARD_APPROVED',
  REJECTED: 'REJECTED',
  CHECKED_OUT: 'CHECKED_OUT',
  CHECKED_IN: 'CHECKED_IN',
  EXTENSION_PENDING: 'EXTENSION_PENDING',
  EXTENSION_APPROVED: 'EXTENSION_APPROVED',
  EXTENSION_REJECTED: 'EXTENSION_REJECTED',
};

export const HOSTEL_STATUS = {
  PRESENT: 'PRESENT_IN_HOSTEL',
  OUTSIDE: 'OUTSIDE_HOSTEL',
};

export const STATUS_CONFIG = {
  [LEAVE_STATUS.PENDING_PARENT_APPROVAL]: {
    label: 'Pending Parent Approval',
    shortLabel: 'Pending Parent',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    icon: 'Clock',
  },
  [LEAVE_STATUS.PARENT_APPROVED]: {
    label: 'Parent Approved',
    shortLabel: 'Parent Approved',
    bg: '#E0F2FE',
    text: '#0369A1',
    border: '#BAE6FD',
    icon: 'CheckCircle2',
  },
  [LEAVE_STATUS.PARENT_REJECTED]: {
    label: 'Parent Rejected',
    shortLabel: 'Parent Rejected',
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: 'XCircle',
  },
  [LEAVE_STATUS.PENDING_GATE_CLEARANCE]: {
    label: 'Eligible for Gate Exit',
    shortLabel: 'Gate Clearance',
    bg: '#EEF2FF',
    text: '#4338CA',
    border: '#E0E7FF',
    icon: 'ShieldCheck',
  },
  [LEAVE_STATUS.WARDEN_APPROVED]: {
    label: 'Warden Approved',
    shortLabel: 'Warden Approved',
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#BBF7D0',
    icon: 'CheckCircle2',
  },
  [LEAVE_STATUS.REJECTED]: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: 'XCircle',
  },
  [LEAVE_STATUS.CHECKED_OUT]: {
    label: 'Outside Hostel (Checked Out)',
    shortLabel: 'Checked Out',
    bg: '#FEF9C3',
    text: '#A16207',
    border: '#FEF08A',
    icon: 'LogOut',
  },
  [LEAVE_STATUS.CHECKED_IN]: {
    label: 'Completed (Checked In)',
    shortLabel: 'Checked In',
    bg: '#F1F5F9',
    text: '#475569',
    border: '#E2E8F0',
    icon: 'LogIn',
  },
  [LEAVE_STATUS.EXTENSION_PENDING]: {
    label: 'Extension Pending Parent',
    shortLabel: 'Extension Pending',
    bg: '#FFEDD5',
    text: '#C2410C',
    border: '#FED7AA',
    icon: 'AlertCircle',
  },
  [LEAVE_STATUS.EXTENSION_APPROVED]: {
    label: 'Extension Approved',
    shortLabel: 'Ext. Approved',
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#BBF7D0',
    icon: 'CalendarCheck',
  },
  [LEAVE_STATUS.EXTENSION_REJECTED]: {
    label: 'Extension Rejected',
    shortLabel: 'Ext. Rejected',
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: 'XCircle',
  },
};

export const HOSTEL_STATUS_CONFIG = {
  [HOSTEL_STATUS.PRESENT]: {
    label: 'Present in Hostel',
    bg: '#DCFCE7',
    text: '#15803D',
    dot: '#16A34A',
  },
  [HOSTEL_STATUS.OUTSIDE]: {
    label: 'Outside Hostel',
    bg: '#FEF3C7',
    text: '#B45309',
    dot: '#F59E0B',
  },
};
