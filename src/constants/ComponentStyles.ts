import { StyleSheet } from "react-native";

export const themedButtonStyles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export const themedErrorMessageStyles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export const themedCardStyles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export const themedDropdownStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxHeight: "60%",
  },
});

export const themedListStyles = StyleSheet.create({
  list: {
    width: "100%",
  },
  itemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});

/**
 * Video Component Styles
 *
 * Note: Video backgrounds are always black regardless of theme for optimal viewing.
 * See Colors.videoBackground and Colors.videoOverlay for theme-specific values.
 */
export const themedVideoStyles = StyleSheet.create({
  participantCard: {
    width: 160,
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000", // Always black for video (Colors.videoBackground)
  },
  videoStream: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  userInfoOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent (Colors.videoOverlay)
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userNameText: {
    color: "#FFFFFF", // Always white text on video overlay
    fontSize: 12,
    fontWeight: "600",
  },
});
