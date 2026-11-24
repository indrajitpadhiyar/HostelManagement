import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../hooks/useApp';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import NotificationCard from '../../components/cards/NotificationCard';
import EmptyState from '../../components/common/EmptyState';
import { CheckCheck } from 'lucide-react-native';

export default function WardenNotifications() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const wardenNotifs = notifications.filter(
    (n) => n.userId === currentUser?.id || n.role === 'warden'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Warden Alerts"
        subtitle={`${wardenNotifs.filter((n) => !n.read).length} Unread System Notices`}
        showBack={true}
        onBack={() => router.back()}
        showNotifications={false}
        rightAction={
          wardenNotifs.length > 0 && (
            <TouchableOpacity
              onPress={() => markAllNotificationsAsRead('warden')}
              style={styles.markAllBtn}
              activeOpacity={0.7}
            >
              <CheckCheck size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.markAllText}>Mark Read</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {wardenNotifs.length > 0 ? (
          wardenNotifs.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onPress={() => {
                markNotificationAsRead(notif.id);
                if (notif.requestId) {
                  router.push({
                    pathname: '/(warden)/leave-details',
                    params: { id: notif.requestId },
                  });
                }
              }}
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title="No Notifications"
            description="You don't have any warden notices right now."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primarySubtle,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
