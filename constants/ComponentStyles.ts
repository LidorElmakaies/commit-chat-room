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
