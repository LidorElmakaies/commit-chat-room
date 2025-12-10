# Application Configuration

Central location for all app-wide constants and configuration values.

## Structure

All configuration is exported from `src/config/index.ts`:

```typescript
import { LiveKitConfig, MatrixConfig, DebugConfig } from "../config";
```

**Note:** UI styling constants (dimensions, colors, etc.) are in `src/constants/`.

## Configuration Sections

### **LiveKitConfig**

Real-time video/audio communication settings.

```typescript
LiveKitConfig.serverUrl; // LiveKit Cloud WebSocket URL
LiveKitConfig.tokenTTL; // Token expiration time (e.g., "24h")
```

**Example:**

```typescript
await room.connect(LiveKitConfig.serverUrl, token);
```

**Note:** Room IDs must be explicitly provided - no default fallback.

### **MatrixConfig**

Matrix homeserver and sync settings.

```typescript
MatrixConfig.homeserverUrl; // Matrix.org URL
MatrixConfig.initialSyncLimit; // Message history limit
```

### **DebugConfig**

Toggle debug features (automatically enabled in development).

```typescript
DebugConfig.enableLogging; // Verbose logging
DebugConfig.logWebRTCEvents; // WebRTC event logging
```

Uses `__DEV__` flag to automatically enable in development mode.

## Why Use Config?

✅ **Single source of truth** - Change values in one place
✅ **Type-safe** - TypeScript autocomplete and error checking
✅ **Documented** - Comments explain what each value does
✅ **Easy to find** - All constants in one location
✅ **Environment-aware** - Use `__DEV__` for dev/prod differences

## Config vs Constants

**`src/config/`** - Application behavior:

- API URLs (LiveKit, Matrix)
- Feature flags (debug mode)
- Default settings (audio/video states)

**`src/constants/`** - UI/styling:

- Colors, typography
- Component styles
- Dimensions, spacing

## Best Practices

1. **Don't hardcode values** - Use config constants instead
2. **Add comments** - Explain what each value controls
3. **Use `as const`** - Makes values readonly and type-safe
4. **Group by feature** - Keep related settings together
5. **Config = behavior, Constants = appearance**

## Example Usage

**Before (hardcoded):**

```typescript
await room.connect("wss://my-server.livekit.cloud", token);
```

**After (config):**

```typescript
import { LiveKitConfig } from "../config";
await room.connect(LiveKitConfig.serverUrl, token);
```

## Future Enhancements

- Add environment-specific configs (dev, staging, prod)
- Integrate with `.env` files for sensitive values
- Add runtime config validation
