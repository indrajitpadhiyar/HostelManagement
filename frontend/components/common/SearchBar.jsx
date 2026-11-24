import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search by name, enrollment no...',
  onClear,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topGloss} />
      <Search size={18} color={COLORS.primary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            if (onClear) onClear();
            else onChangeText('');
          }}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={14} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    position: 'relative',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(240, 246, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
