import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function SecondaryButton({
  title,
  onPress,
  icon: Icon,
  disabled = false,
  variant = 'outline', // 'outline' | 'ghost'
  style,
  textStyle,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <LinearGradient
        colors={
          variant === 'outline'
            ? ['rgba(255, 255, 255, 0.95)', 'rgba(240, 246, 255, 0.75)']
            : ['rgba(240, 246, 255, 0.6)', 'rgba(230, 240, 255, 0.4)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerGradient}
      >
        <View style={styles.topGloss} />
        {Icon && (
          <Icon
            size={17}
            color={disabled ? COLORS.textMuted : COLORS.textPrimary}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.title,
            disabled && { color: COLORS.textMuted },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: 14,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  innerGradient: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  icon: {
    marginRight: 6,
  },
});
