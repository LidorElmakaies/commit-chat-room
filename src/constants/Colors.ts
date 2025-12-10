/**
 * App Theme Colors
 *
 * Light: Clean Blue/White theme (Professional, Airy)
 * Dark: Deep Purple/Black theme (Modern, High Contrast)
 */

const tintColorLight = "#3B82F6"; // Blue 500
const tintColorDark = "#A855F7"; // Purple 500

export const Colors = {
  light: {
    primary: "#3B82F6", // Default primary (Blue)
    text: "#1E293B", // Slate 800
    textSecondary: "#64748B", // Slate 500
    background: "#F5F7FA", // Very light blue-grey
    uiBackground: "#FFFFFF", // Pure white cards
    tint: tintColorLight,
    iconColor: "#64748B", // Slate 500
    iconColorFocused: tintColorLight,
    tabIconDefault: "#64748B",
    tabIconSelected: tintColorLight,
    border: "#E2E8F0", // Slate 200
    error: "#EF4444", // Red 500

    // Button variants
    success: "#2e7d32", // Green 800 (darker for light mode)
    danger: "#c62828", // Red 800 (darker for light mode)
    buttonText: "#FFFFFF", // White text on colored buttons

    // Video components
    videoBackground: "#000000", // Black for video containers
    videoOverlay: "rgba(0, 0, 0, 0.7)", // Semi-transparent overlay for text
    videoPlaceholder: "#1a1a1a", // Dark grey for empty video
  },
  dark: {
    primary: "#8B5CF6", // Violet 500 (Purple)
    text: "#F3F4F6", // Cool Gray 100
    textSecondary: "#9CA3AF", // Cool Gray 400
    background: "#0F0E13", // Deep Black/Purple
    uiBackground: "#1D1B26", // Dark Purple-Grey Surface
    tint: tintColorDark,
    iconColor: "#9CA3AF", // Cool Gray 400
    iconColorFocused: tintColorDark,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorDark,
    border: "#2E2C3D", // Dark Purple Border
    error: "#CF6679", // Light Red

    // Button variants
    success: "#66bb6a", // Green 400 (lighter for dark mode)
    danger: "#ef5350", // Red 400 (lighter for dark mode)
    buttonText: "#FFFFFF", // White text on colored buttons

    // Video components
    videoBackground: "#000000", // Black for video containers
    videoOverlay: "rgba(0, 0, 0, 0.7)", // Semi-transparent overlay for text
    videoPlaceholder: "#1a1a1a", // Dark grey for empty video
  },
};

export default Colors;
