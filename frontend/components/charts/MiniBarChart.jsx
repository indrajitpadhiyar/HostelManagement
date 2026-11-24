import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function MiniBarChart({
  data = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 14 },
    { label: 'Wed', value: 6 },
    { label: 'Thu', value: 18 },
    { label: 'Fri', value: 25 },
    { label: 'Sat', value: 29 },
    { label: 'Sun', value: 12 },
  ],
  title = 'Weekly Exit Frequency',
  style,
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 84;

  return (
    <View style={[styles.outerCard, style]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 247, 255, 0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerCard}
      >
        <View style={styles.topGloss} />
        {title && <Text style={styles.title}>{title}</Text>}

        <View style={styles.chartWrapper}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const isHighest = item.value === maxValue;

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.valueText}>{item.value}</Text>
                <View style={[styles.barTrack, { height: chartHeight }]}>
                  <LinearGradient
                    colors={
                      isHighest
                        ? COLORS.gradients.liquidBlue
                        : ['rgba(147, 197, 253, 0.9)', 'rgba(96, 165, 250, 0.7)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.barFill,
                      {
                        height: Math.max(barHeight, 6),
                      },
                    ]}
                  >
                    <View style={styles.barGloss} />
                  </LinearGradient>
                </View>
                <Text style={styles.labelText}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  innerCard: {
    padding: 16,
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 114,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  barTrack: {
    width: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.4)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  barGloss: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  labelText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: '600',
  },
});
