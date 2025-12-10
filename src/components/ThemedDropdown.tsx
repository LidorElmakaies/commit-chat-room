import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { themedDropdownStyles } from "../constants/ComponentStyles";
import { ThemedText } from "./text";
import ThemedList from "./ThemedList";
import ThemedView from "./ThemedView";

interface ThemedDropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
  value?: string;
  minHeight?: number; // Minimum height for the dropdown modal
}

export default function ThemedDropdown({
  options,
  onSelect,
  placeholder = "Select an option",
  value,
  minHeight = 200, // Default minHeight for better visibility
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
              <ThemedView
                style={[themedDropdownStyles.modalContent, { minHeight }]}
              >
                {options.length > 0 ? (
                  <ThemedList
                    data={options.map((option) => ({
                      label: option,
                      onItemPress: () => handleSelect(option),
                    }))}
                  />
                ) : (
                  <ThemedText>No options available</ThemedText>
                )}
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
