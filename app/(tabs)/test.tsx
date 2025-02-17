import { View, Text, StyleSheet } from "react-native";
import tw from "tailwind-react-native-classnames";

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from '@/components/ThemedText';


export default function TestScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="chevron.left.forwardslash.chevron.right"
            style={styles.headerImage}
          />
        }>
        <View>
          <ThemedText style={tw`text-blue-500`}>Đây là trang Test</ThemedText>
        </View>

      </ParallaxScrollView>
    </>
  );
}
const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
