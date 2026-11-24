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

export default function GuardNotifications() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const guardNotifs = notifications.filter(
    (n) => n.userId === currentUser?.id || n.role === 'guard'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Guard Terminal Alerts"
        subtitle={`${guardNotifs.filter((n) => !n.read).length} Unread Clearance Notices`}
        showBack={true}
        onBack={() => router.back()}
        showNotifications={false}
        rightAction={
          guardNotifs.length > 0 && (
            <TouchableOpacity
              onPress={() => markAllNotificationsAsRead('guard')}
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
        {guardNotifs.length > 0 ? (
          guardNotifs.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onPress={() => {
                markNotificationAsRead(notif.id);
                if (notif.requestId) {
                  router.push({
                    pathname: '/(guard)/gate-exit',
                    params: { selectedId: notif.requestId },
                  });
                }
              }}
              style={{ marginBottom: 10 }}
            />
          ))
        ) : (
          <EmptyState
            title="No Notifications"
            description="You don't have any terminal notifications right now."
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
