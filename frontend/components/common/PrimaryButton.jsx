import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function PrimaryButton({
  title,
  onPress,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'danger' | 'success' | 'cyan'
  style,
  textStyle,
}) {
  const getGradientColors = () => {
    if (disabled) return ['#94A3B8', '#CBD5E1'];
    switch (variant) {
      case 'danger':
        return COLORS.gradients.liquidDanger;
      case 'success':
        return COLORS.gradients.liquidSuccess;
      case 'cyan':
        return COLORS.gradients.liquidCyan;
      case 'primary':
      default:
        return COLORS.gradients.liquidBlue;
    }
  };

  const getShadowColor = () => {
    if (disabled) return 'transparent';
    switch (variant) {
      case 'danger':
        return COLORS.danger;
      case 'success':
        return COLORS.success;
      case 'primary':
      default:
        return COLORS.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.touchableWrapper,
        { shadowColor: getShadowColor() },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Specular Liquid Glass Top Highlight */}
        <View style={styles.topGloss} />

        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.contentRow}>
            {Icon && iconPosition === 'left' && (
              <Icon size={18} color="#FFFFFF" style={styles.iconLeft} />
            )}
            <Text style={[styles.title, textStyle]}>{title}</Text>
            {Icon && iconPosition === 'right' && (
              <Icon size={18} color="#FFFFFF" style={styles.iconRight} />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableWrapper: {
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
