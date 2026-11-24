import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function GlassCard({
  children,
  style,
  tint = 'light', // 'light' | 'subtle' | 'accent' | 'frost'
  noPadding = false,
  intensity = 'medium',
}) {
  const getGradientColors = () => {
    switch (tint) {
      case 'accent':
        return ['rgba(239, 246, 255, 0.95)', 'rgba(219, 234, 254, 0.8)'];
      case 'frost':
        return ['rgba(255, 255, 255, 0.95)', 'rgba(238, 245, 255, 0.82)'];
      case 'subtle':
        return ['rgba(255, 255, 255, 0.78)', 'rgba(245, 248, 255, 0.65)'];
      case 'light':
      default:
        return ['rgba(255, 255, 255, 0.92)', 'rgba(243, 248, 255, 0.85)'];
    }
  };

  return (
    <View style={[styles.outerContainer, style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientInner, noPadding && { padding: 0 }]}
      >
        {/* Specular Top Rim Reflection */}
        <View style={styles.specularTopLine} />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  gradientInner: {
    padding: 16,
    position: 'relative',
  },
  specularTopLine: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});
