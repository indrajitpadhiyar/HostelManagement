import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = COLORS.primary,
  style,
}) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 247, 255, 0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardInner}
      >
        {/* Top glossy specular reflection */}
        <View style={styles.topGloss} />

        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: color + '18', borderColor: color + '30' }]}>
            <Icon size={20} color={color} />
          </View>
        </View>

        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardInner: {
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
  topRow: {
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});
