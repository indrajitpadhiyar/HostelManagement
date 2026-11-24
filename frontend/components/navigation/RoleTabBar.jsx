import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import {
  Home,
  User,
  PlusCircle,
  Clock,
  CheckSquare,
  Users,
  Building,
  FileBarChart,
  QrCode,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_BAR_WIDTH = SCREEN_WIDTH - 24; // 12px padding on each side

const SUB_ROUTE_MAP = {
  // Student sub-routes
  'extend-leave': 'leave-history',
  'leave-details': 'leave-history',

  // Parent sub-routes
  'leave-details': 'approvals',

  // Warden sub-routes
  'student-details': 'students',
  'activities': 'dashboard',
  'guards': 'dashboard',
  'attendance': 'dashboard',

  // Guard sub-routes
  'gate-exit': 'dashboard',
  'gate-return': 'dashboard',
};

// Module-level memory of last active index per role to enable smooth inter-screen sliding
const previousActiveIndexByRole = {};

export default function RoleTabBar({ role = 'student' }) {
  const router = useRouter();
  const pathname = usePathname();

  const getTabs = () => {
    switch (role) {
      case 'student':
        return [
          { name: 'Dashboard', icon: Home, route: '/(student)/dashboard' },
          { name: 'Apply', icon: PlusCircle, route: '/(student)/apply-leave' },
          { name: 'History', icon: Clock, route: '/(student)/leave-history' },
          { name: 'Profile', icon: User, route: '/(student)/profile' },
        ];
      case 'parent':
        return [
          { name: 'Overview', icon: Home, route: '/(parent)/dashboard' },
          { name: 'Approvals', icon: CheckSquare, route: '/(parent)/approvals' },
          { name: 'History', icon: Clock, route: '/(parent)/history' },
        ];
      case 'warden':
        return [
          { name: 'Overview', icon: Home, route: '/(warden)/dashboard' },
          { name: 'Students', icon: Users, route: '/(warden)/students' },
          { name: 'Leaves', icon: CheckSquare, route: '/(warden)/leave-requests' },
          { name: 'Rooms', icon: Building, route: '/(warden)/rooms' },
          { name: 'Reports', icon: FileBarChart, route: '/(warden)/reports' },
        ];
      case 'guard':
        return [
          { name: 'Terminal', icon: Home, route: '/(guard)/dashboard' },
          { name: 'Approved', icon: CheckSquare, route: '/(guard)/approved-leaves' },
          { name: 'Scan/Verify', icon: QrCode, route: '/(guard)/verify-student' },
          { name: 'Gate Log', icon: Clock, route: '/(guard)/gate-history' },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();

  const getActiveIndexFromPath = (path) => {
    if (!path) return 0;

    // Clean up parentheses from groups: e.g. "/(student)/apply-leave" -> "/student/apply-leave" or "/apply-leave"
    const cleanPath = path.replace(/[()]/g, '');
    const segments = cleanPath.split('/').filter(Boolean);
    let targetSegment = segments[segments.length - 1] || '';

    // Check if it's a known sub-route that maps to a tab
    if (SUB_ROUTE_MAP[targetSegment]) {
      targetSegment = SUB_ROUTE_MAP[targetSegment];
    }

    // Match by leaf segment name (e.g. "apply-leave", "dashboard", "leave-history", "profile")
    const matchIdx = tabs.findIndex((tab) => {
      const tabSegments = tab.route.replace(/[()]/g, '').split('/').filter(Boolean);
      const tabLeaf = tabSegments[tabSegments.length - 1] || '';
      return (
        targetSegment === tabLeaf ||
        cleanPath.endsWith('/' + tabLeaf) ||
        cleanPath === '/' + tabLeaf ||
        tab.route.includes(targetSegment)
      );
    });

    return matchIdx >= 0 ? matchIdx : 0;
  };

  const targetIndex = getActiveIndexFromPath(pathname);
  // Start from where the user previously clicked if navigating from another screen, so it glides smoothly!
  const fromIndex =
    previousActiveIndexByRole[role] !== undefined
      ? previousActiveIndexByRole[role]
      : targetIndex;

  const [activeIndex, setActiveIndex] = useState(targetIndex);
  const [dockWidth, setDockWidth] = useState(DEFAULT_BAR_WIDTH);

  const slideAnim = useRef(new Animated.Value(fromIndex)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  // On mount and when pathname changes, smoothly glide the slider to targetIndex
  useEffect(() => {
    const currentIdx = getActiveIndexFromPath(pathname);
    setActiveIndex(currentIdx);
    previousActiveIndexByRole[role] = currentIdx;

    Animated.spring(slideAnim, {
      toValue: currentIdx,
      useNativeDriver: true,
      tension: 68,
      friction: 9,
    }).start();
  }, [pathname]);

  const handleTabPress = (idx, route) => {
    const cleanCurrent = (pathname || '').replace(/[()]/g, '');
    const cleanTarget = route.replace(/[()]/g, '');
    const isExactMatch =
      cleanCurrent === cleanTarget ||
      cleanCurrent.endsWith('/' + cleanTarget.split('/').pop());

    if (idx === activeIndex && isExactMatch) return;

    previousActiveIndexByRole[role] = activeIndex;
    setActiveIndex(idx);

    // Tactile liquid droplet cushion bounce
    Animated.sequence([
      Animated.timing(pressScaleAnim, {
        toValue: 0.92,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(pressScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth sliding animation across tabs
    Animated.spring(slideAnim, {
      toValue: idx,
      useNativeDriver: true,
      tension: 68,
      friction: 9,
    }).start();

    router.replace(route);
  };

  const horizontalPadding = 8;
  const innerWidth = dockWidth - horizontalPadding * 2;
  const tabWidth = tabs.length > 0 ? innerWidth / tabs.length : 0;
  const pillMargin = 4;
  const pillWidth = Math.max(0, tabWidth - pillMargin * 2);

  const pillTranslateX =
    tabs.length > 1
      ? slideAnim.interpolate({
          inputRange: tabs.map((_, i) => i),
          outputRange: tabs.map((_, i) => i * tabWidth),
        })
      : 0;

  return (
    <View style={styles.dockContainer}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.94)', 'rgba(240, 246, 255, 0.88)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dockBar}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w && Math.abs(w - dockWidth) > 1) {
            setDockWidth(w);
          }
        }}
      >
        {/* Specular gloss top edge for liquid glass dock */}
        <View style={styles.topGloss} />

        {/* Smooth Gliding Transparent Liquid Glass Capsule */}
        {tabs.length > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingPill,
              {
                width: pillWidth,
                left: horizontalPadding + pillMargin,
                transform: [
                  { translateX: pillTranslateX },
                  { scale: pressScaleAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.12)', 'rgba(59, 130, 246, 0.22)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillGradient}
            >
              {/* Refraction specular highlights on top and bottom */}
              <View style={styles.pillTopSpecular} />
              <View style={styles.pillBottomGleam} />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Tab Items with Smooth Native Cross-Fading */}
        {tabs.map((tab, idx) => {
          const IconComponent = tab.icon;

          const tabScale =
            tabs.length > 1
              ? slideAnim.interpolate({
                  inputRange: [idx - 1, idx, idx + 1],
                  outputRange: [0.94, 1.05, 0.94],
                  extrapolate: 'clamp',
                })
              : 1;

          const activeOpacity =
            tabs.length > 1
              ? slideAnim.interpolate({
                  inputRange: [idx - 0.5, idx, idx + 0.5],
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                })
              : 1;

          const inactiveOpacity =
            tabs.length > 1
              ? slideAnim.interpolate({
                  inputRange: [idx - 0.5, idx, idx + 0.5],
                  outputRange: [1, 0, 1],
                  extrapolate: 'clamp',
                })
              : 0;

          return (
            <TouchableOpacity
              key={idx}
              style={styles.tabItem}
              onPress={() => handleTabPress(idx, tab.route)}
              activeOpacity={0.75}
            >
              <Animated.View
                style={[
                  styles.tabContentContainer,
                  { transform: [{ scale: tabScale }] },
                ]}
              >
                {/* Inactive state layer (soft slate gray) */}
                <Animated.View
                  style={[
                    styles.layerContainer,
                    { opacity: inactiveOpacity },
                  ]}
                >
                  <IconComponent size={20} color={COLORS.textMuted} strokeWidth={1.8} />
                  <Text style={styles.inactiveLabel} numberOfLines={1}>
                    {tab.name}
                  </Text>
                  <View style={styles.dotPlaceholder} />
                </Animated.View>

                {/* Active state layer (vibrant royal blue on transparent liquid glass) */}
                <Animated.View
                  style={[
                    styles.layerContainer,
                    styles.activeLayer,
                    { opacity: activeOpacity },
                  ]}
                >
                  <IconComponent size={20} color={COLORS.primary} strokeWidth={2.4} />
                  <Text style={styles.activeLabel} numberOfLines={1}>
                    {tab.name}
                  </Text>
                  <View style={styles.activeDot} />
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 4,
    backgroundColor: 'transparent',
  },
  dockBar: {
    height: 66,
    borderRadius: 33, // Fully rounded capsule shape
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 1,
  },
  slidingPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 999, // Pure rounded capsule
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 1,
  },
  pillGradient: {
    flex: 1,
    borderRadius: 999, // Pure rounded capsule
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.2,
    borderColor: 'rgba(59, 130, 246, 0.38)', // Luminous crystal glass rim
  },
  pillTopSpecular: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Top glass shine
    borderRadius: 1,
  },
  pillBottomGleam: {
    position: 'absolute',
    bottom: 1,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.22)', // Subtle inner refraction
    borderRadius: 1,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    position: 'relative',
  },
  layerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  activeLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  activeLabel: {
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  inactiveLabel: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
});
