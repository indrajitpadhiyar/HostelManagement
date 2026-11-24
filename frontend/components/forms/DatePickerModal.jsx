import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import PrimaryButton from '../common/PrimaryButton';

export default function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  minDate,
  title = 'Select Date',
}) {
  const parseDate = (dStr) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState(() => parseDate(initialDate));
  const [selectedDate, setSelectedDate] = useState(() => initialDate || formatDateString(new Date()));

  function formatDateString(d) {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (dayNum) => {
    const formatted = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    setSelectedDate(formatted);
  };

  const handleConfirm = () => {
    onSelectDate(selectedDate);
    onClose();
  };

  const setShortcut = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const formatted = formatDateString(d);
    setCurrentMonth(d);
    setSelectedDate(formatted);
  };

  const minD = minDate ? parseDate(minDate) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Calendar size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick shortcuts */}
          <View style={styles.shortcutsRow}>
            <TouchableOpacity style={styles.shortcut} onPress={() => setShortcut(0)}>
              <Text style={styles.shortcutText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcut} onPress={() => setShortcut(1)}>
              <Text style={styles.shortcutText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcut} onPress={() => setShortcut(3)}>
              <Text style={styles.shortcutText}>+3 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcut} onPress={() => setShortcut(7)}>
              <Text style={styles.shortcutText}>+1 Week</Text>
            </TouchableOpacity>
          </View>

          {/* Month selector */}
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <ChevronLeft size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {months[month]} {year}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <ChevronRight size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.daysHeader}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <Text key={i} style={styles.dayHeaderCell}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(year, month, day);
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isDisabled = minD && dateObj < new Date(minD.getFullYear(), minD.getMonth(), minD.getDate());

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    isDisabled && styles.disabledDayCell,
                  ]}
                  disabled={isDisabled}
                  onPress={() => handleDaySelect(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isDisabled && styles.disabledDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selection indicator */}
          <View style={styles.selectionPreview}>
            <Text style={styles.selectedLabel}>Selected Date:</Text>
            <Text style={styles.selectedDateText}>{selectedDate}</Text>
          </View>

          {/* Confirm Button */}
          <PrimaryButton
            title="Confirm Date"
            onPress={handleConfirm}
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  shortcut: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  dayHeaderCell: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
  },
  disabledDayCell: {
    opacity: 0.25,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledDayText: {
    color: COLORS.textMuted,
  },
  selectionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  selectedLabel: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmBtn: {
    height: 44,
  },
});
