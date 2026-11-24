import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { useApp } from '../../hooks/useApp';

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showNotifications = true,
  notificationRoute,
  rightAction,
  showLogout = false,
}) {
  const router = useRouter();
  const { currentUser, logout, notifications } = useApp();

  const unreadCount = notifications.filter(
    (n) => n.role === currentUser?.role && !n.read
  ).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    if (notificationRoute) {
      router.push(notificationRoute);
    } else if (currentUser?.role) {
      const routes = {
        student: '/(student)/notifications',
        parent: '/(parent)/notifications',
        warden: '/(warden)/notifications',
        guard: '/(guard)/notifications',
      };
      const target = routes[currentUser.role] || '/(auth)/login';
      router.push(target);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 246, 255, 0.88)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.topSpecularLine} />

        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {rightAction}

          {showNotifications && (
            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleNotificationPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Bell size={19} color={COLORS.textPrimary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showLogout && (
            <TouchableOpacity
              style={[styles.glassButton, styles.logoutBtn]}
              onPress={logout}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LogOut size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderBottomWidth: 1.2,
    borderBottomColor: COLORS.glassBorderTint,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  topSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginRight: 10,
  },
  logoutBtn: {
    backgroundColor: 'rgba(254, 226, 226, 0.7)',
    borderColor: 'rgba(254, 202, 202, 0.8)',
    marginLeft: 6,
    marginRight: 0,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
