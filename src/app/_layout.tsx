import Drawer from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDrawerContent } from '@/components/app-drawer-content';
import { LexiTheme } from '@/constants/lexi-theme';
import { LexiProvider } from '@/providers/lexi-provider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LexiProvider>
          <StatusBar style="dark" />
          <Drawer
            drawerContent={(props) => <AppDrawerContent navigation={props.navigation} />}
            screenOptions={{
              drawerStyle: {
                backgroundColor: LexiTheme.colors.background,
                width: 320,
              },
              headerShown: false,
              overlayColor: 'rgba(0, 30, 64, 0.28)',
              sceneStyle: {
                backgroundColor: LexiTheme.colors.background,
              },
            }}>
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: 'Home',
                title: 'Home',
              }}
            />
            <Drawer.Screen
              name="saved"
              options={{
                drawerLabel: 'Saved',
                title: 'Saved',
              }}
            />
            <Drawer.Screen
              name="recent"
              options={{
                drawerLabel: 'Recent',
                title: 'Recent',
              }}
            />
            <Drawer.Screen
              name="settings"
              options={{
                drawerLabel: 'Settings',
                title: 'Settings',
              }}
            />
            <Drawer.Screen
              name="word/[term]"
              options={{
                drawerItemStyle: { display: 'none' },
                swipeEnabled: false,
                title: 'Word Details',
              }}
            />
          </Drawer>
        </LexiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
