import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function FilterChips({
  options = [],
  selected,
  onSelect,
  style,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        {options.map((option) => {
          const isSelected = selected === option.value;

          if (isSelected) {
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSelect(option.value)}
                activeOpacity={0.8}
                style={styles.selectedTouchable}
              >
                <LinearGradient
                  colors={['rgba(37, 99, 235, 0.12)', 'rgba(59, 130, 246, 0.22)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.selectedGradient}
                >
                  <View style={styles.topGloss} />
                  <Text style={styles.labelSelected}>{option.label}</Text>
                  {option.count !== undefined && (
                    <Text style={styles.countSelected}>{option.count}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={option.value}
              style={styles.chipUnselected}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.topGlossUnselected} />
              <Text style={styles.labelUnselected}>{option.label}</Text>
              {option.count !== undefined && (
                <Text style={styles.countUnselected}>{option.count}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 46,
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrollView: {
    flexGrow: 0,
    height: 44,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Prevents any vertical stretching
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedTouchable: {
    height: 34,
    borderRadius: 999, // Pill capsule
    alignSelf: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedGradient: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: 'rgba(59, 130, 246, 0.38)',
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 1,
  },
  topGlossUnselected: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1,
  },
  chipUnselected: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  labelSelected: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  labelUnselected: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  countSelected: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.16)',
    color: COLORS.primary,
  },
  countUnselected: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    color: COLORS.textMuted,
  },
});
