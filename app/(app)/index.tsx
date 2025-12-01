import { Link } from "expo-router";
import React from "react";
import { ThemedView, ThemedButton } from "../../components";
import { commonStyles } from "../../constants/Styles";

const RoomManagementScreen = () => {
  return (
    <ThemedView style={commonStyles.container}>
      <Link href="/create-room" asChild>
        <ThemedButton
          title="Create a Room"
          style={{ marginBottom: 10, width: "80%" }}
        />
      </Link>
      <Link href="/join-room" asChild>
        <ThemedButton title="Join a Room" style={{ width: "80%" }} />
      </Link>
    </ThemedView>
  );
};

export default RoomManagementScreen;
