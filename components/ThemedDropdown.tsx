import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedList, ThemedText, ThemedView } from ".";
import { themedDropdownStyles } from "../constants/ComponentStyles";

interface ThemedDropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
  value?: string;
}

export default function ThemedDropdown({
  options,
  onSelect,
  placeholder = "Select an option",
  value,
}: ThemedDropdownProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View style={themedDropdownStyles.container}>
      <TouchableOpacity
        style={[
          themedDropdownStyles.button,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText style={themedDropdownStyles.buttonText}>
          {value || placeholder}
        </ThemedText>
        <MaterialIcons
          name={modalVisible ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={themedDropdownStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ThemedView style={themedDropdownStyles.modalContent}>
                <ThemedList
                  data={options.map((option) => ({
                    label: option,
                    onItemPress: () => handleSelect(option),
                  }))}
                />
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
