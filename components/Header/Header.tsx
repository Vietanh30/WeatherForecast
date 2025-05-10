import React from "react";
import { View, TouchableOpacity, StyleSheet, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function Header() {
    const router = useRouter();

    const handleSearchPress = () => {
        Keyboard.dismiss(); // Dismiss keyboard on search
        router.push("/location" as any);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton} accessibilityLabel="Search">
                <Ionicons name="search" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 8,
    },
    searchButton: {
        backgroundColor: "transparent", // No background
        padding: 0, // Remove padding
    },
});

export default Header;
