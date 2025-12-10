/**
 * Application Configuration
 *
 * Central location for all app-wide constants and configuration.
 * Separates concerns and makes it easy to change values across the app.
 */

/**
 * LiveKit Configuration
 * Real-time video/audio communication settings
 */
export const LiveKitConfig = {
  /** LiveKit Cloud WebSocket URL */
  serverUrl: "wss://my-new-project-ndiksqcb.livekit.cloud",

  /** Token time-to-live (how long tokens are valid) */
  tokenTTL: "24h",
} as const;

/**
 * Matrix Configuration
 * Matrix homeserver and sync settings
 */
export const MatrixConfig = {
  /** Matrix homeserver URL */
  homeserverUrl: "https://matrix.org",

  /** Initial sync limit for messages */
  initialSyncLimit: 20,
} as const;

/**
 * Development/Debug Configuration
 * Toggle debug features
 */
export const DebugConfig = {
  /** Enable verbose logging */
  enableLogging: __DEV__,

  /** Log WebRTC events */
  logWebRTCEvents: __DEV__,
} as const;
