import React from "react";
import { Text } from "react-native";
import { ThemedView } from "../../components";
import { commonStyles } from "../../constants/Styles";

const RegisterScreen = () => {
  return (
    <ThemedView style={commonStyles.center}>
      <Text style={{ color: "#fff" }}>Register Page</Text>
    </ThemedView>
  );
};

export default RegisterScreen;
