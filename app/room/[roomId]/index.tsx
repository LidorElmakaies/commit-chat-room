import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedButton, ThemedTextInput, ThemedView } from "../../../components";
import { commonStyles } from "../../../constants/Styles";
import { useAppDispatch, useAppSelector } from "../../../src/store";
import { deselectRoom, selectRoom, sendMessage } from "../../../src/store/slices/roomSlice";

export default function RoomIndex() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { currentSelectedRoomId } = useAppSelector((state) => state.room);

  useEffect(() => {
    if (roomId) {
      dispatch(selectRoom(roomId));

      return () => {
        dispatch(deselectRoom());
      };
    }
  }, [roomId, dispatch]);

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !currentSelectedRoomId || isSending) {
      return;
    }

    console.log("[RoomIndex] Sending message:", trimmedMessage);
    setIsSending(true);
    try {
      await dispatch(sendMessage({ roomId: currentSelectedRoomId, body: trimmedMessage })).unwrap();
      setMessageText(""); // Clear input after successful send
    } catch (error) {
      console.error("[RoomIndex] Failed to send message:", error);
      // Keep the message text if sending failed
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ThemedView style={[commonStyles.container, styles.container]}>
      <View style={styles.messageInputContainer}>
        <ThemedTextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
          containerStyle={styles.inputContainer}
          style={styles.input}
          editable={!isSending && !!currentSelectedRoomId}
        />
        <ThemedButton
          title="Send"
          onPress={handleSendMessage}
          loading={isSending}
          style={styles.sendButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  messageInputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    alignItems: "flex-end",
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    minHeight: 44,
    maxHeight: 100,
  },
  sendButton: {
    minWidth: 80,
    height: 44,
  },
});
