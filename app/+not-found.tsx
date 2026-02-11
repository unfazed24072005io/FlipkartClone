import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Home } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Home size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>The page you're looking for doesn't exist.</Text>

        <Link href="/(tabs)/(home)" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
