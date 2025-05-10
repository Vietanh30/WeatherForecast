import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, View, StyleSheet } from 'react-native';
import "../global.css"

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.background}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent'
            }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mapLocation" options={{ title: 'Vị trí' }} />
          <Stack.Screen name="alerts" options={{ title: 'Cảnh báo' }} />
          <Stack.Screen name="searchLocation" options={{ title: 'Tìm kiếm vị trí', headerShown: false }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(80, 60, 150, 0.95)',
  }
});
