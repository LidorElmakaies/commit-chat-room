import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import {
  ThemedButton,
  ThemedText,
  ThemedTextInput,
  ThemedView,
} from "../../../components";
import { Colors } from "../../../constants/Colors";
import { commonStyles } from "../../../constants/Styles";
import { useRoomGuard } from "../../../hooks/useRoomGuard";
import { useAppDispatch, useAppSelector } from "../../../store";
import { sendMessage } from "../../../store/slices/roomSlice";
import { Message, MessageType } from "../../../types";

export default function RoomIndex() {
  const { currentSelectedRoomId, currentRoomMessages } = useAppSelector(
    (state) => state.room
  );
  const room = useRoomGuard(currentSelectedRoomId);
  const dispatch = useAppDispatch();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { userId } = useAppSelector((state) => state.matrixAuth);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentRoomMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentRoomMessages.length]);

  if (!room) {
    // Render nothing while the guard redirects
    return null;
  }

  const formatSenderName = (senderId: string): string => {
    // Extract username from Matrix ID format: @username:server.com
    const match = senderId.match(/^@(.+?):/);
    return match ? match[1] : senderId;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      // Same day: show time only
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Different day: show date and time
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender === userId;
    const senderName = formatSenderName(item.sender);
    const timestamp = formatTimestamp(item.timestamp);

    // Only render text messages for now
    if (
      item.content.type !== MessageType.Text &&
      item.content.type !== MessageType.Notice &&
      item.content.type !== MessageType.Emote
    ) {
      return null;
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <ThemedText type="secondary" style={styles.senderName}>
            {senderName}
          </ThemedText>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? { backgroundColor: theme.primary, alignSelf: "flex-end" }
              : {
                  backgroundColor: theme.uiBackground,
                  alignSelf: "flex-start",
                },
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isOwnMessage ? { color: "#FFFFFF" } : { color: theme.text },
            ]}
          >
            {item.content.body}
          </ThemedText>
        </View>
        <ThemedText type="secondary" style={styles.timestamp}>
          {timestamp}
        </ThemedText>
      </View>
    );
  };

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !currentSelectedRoomId || isSending) {
      return;
    }

    console.log("[RoomIndex] Sending message:", trimmedMessage);
    setIsSending(true);
    try {
      await dispatch(
        sendMessage({ roomId: currentSelectedRoomId, body: trimmedMessage })
      ).unwrap();
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
      <FlatList
        ref={flatListRef}
        data={currentRoomMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesListContent}
        inverted={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />
      <View
        style={[styles.messageInputContainer, { borderTopColor: theme.border }]}
      >
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
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: "100%",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  messageInputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    alignItems: "flex-end",
    borderTopWidth: 1,
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
