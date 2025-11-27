import { Redirect } from "expo-router";

export default function Home() {
  // For now, redirect straight to login
  return <Redirect href="/(auth)/login" />;
}
