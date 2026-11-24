import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Eye, EyeOff } from 'lucide-react-native';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  helperText,
  style,
  inputStyle,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isSecured = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.focusedWrapper,
          error && styles.errorWrapper,
          !editable && styles.disabledWrapper,
        ]}
      >
        <View style={styles.topGloss} />

        {LeftIcon && (
          <LeftIcon
            size={18}
            color={error ? COLORS.danger : isFocused ? COLORS.primary : COLORS.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isSecured}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { minHeight: numberOfLines * 22, textAlignVertical: 'top' },
            !editable && { color: COLORS.textSecondary },
            inputStyle,
          ]}
          autoCapitalize="none"
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={COLORS.textSecondary} />
            ) : (
              <Eye size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconButton}
          >
            <RightIcon size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  inputWrapper: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  multilineWrapper: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  focusedWrapper: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  errorWrapper: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
  },
  disabledWrapper: {
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    paddingVertical: 8,
    fontWeight: '500',
  },
  rightIconButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 11.5,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
