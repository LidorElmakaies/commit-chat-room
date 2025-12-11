import {
  ClientEvent,
  createClient,
  EventTimeline,
  EventType,
  LoginResponse,
  MatrixClient,
  MatrixEvent,
  MsgType,
  Preset,
  Room,
  Visibility,
} from "matrix-js-sdk";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { filter, take } from "rxjs/operators";
import {
  CreateRoomOptions,
  LoginCredentials,
  MatrixSession,
  RoomSummary,
  RoomVisibility,
  UserMediaStream,
} from "../../types";
import { CallManager } from "./CallManager";
import { IEventHandler } from "./handlers/IEventHandler";
import { RoomMessageHandler } from "./handlers/roomMessageHandler";
import { SyncEventHandler } from "./handlers/syncEventHandler";

// Define the response type for LiveKit JWT Service
interface LiveKitCredentials {
  token: string;
  livekit_service_url: string;
}

/**
 * Matrix Service
 *
 * Wrapper around matrix-js-sdk to handle:
 * - Client initialization & authentication
 * - Sync loop management
 * - Room events (messages, membership)
 * - Error handling
 */
class MatrixService {
  private client: MatrixClient | null = null;
  private readonly homeserverUrl: string;

  private syncEventHandler: SyncEventHandler | null = null;
  private readonly timelineHandlers: IEventHandler<any>[];
  public readonly roomMessages$;
  private readonly _isClientReady$ = new BehaviorSubject<boolean>(false);
  public readonly isClientReady$ = this._isClientReady$.asObservable();

  // Call manager - handles all group call functionality
  private callManager: CallManager | null = null;

  // Cache for the discovered LiveKit Service URL
  private liveKitServiceUrl: string | null = null;

  constructor(homeserverUrl: string = "https://matrix.org") {
    this.homeserverUrl = homeserverUrl;
    let messageHandler = new RoomMessageHandler();
    this.roomMessages$ = messageHandler.stream$;
    this.timelineHandlers = [messageHandler];
  }
  // =================================================================================================
  // PUBLIC API
  // =================================================================================================
  /**
   * Logout and clean up
   */
  public async logout(): Promise<void> {
    if (this.client) {
      console.debug("[MatrixService] Logout...");
      this.client.stopClient();
      await this.client.logout();
      this.client = null;
    }

    // Clean up call manager
    if (this.callManager) {
      this.callManager.leaveCall();
      this.callManager = null;
    }

    // Reset state
    this._isClientReady$.next(false);
    console.debug("[MatrixService] Logged out and state reset");
  }

  /**
   * Initialize and login a new client
   */
  public async login(credentials: LoginCredentials): Promise<MatrixSession> {
    const loginResponse = await createClient({
      baseUrl: this.homeserverUrl,
    }).loginRequest({
      type: "m.login.password",
      user: credentials.username,
      password: credentials.password,
    });
    return await this.start(loginResponse);
  }

  public async loginWithToken(credentials: MatrixSession) {
    return await this.start({
      access_token: credentials.accessToken,
      device_id: credentials.deviceId,
      user_id: credentials.userId,
    });
  }

  /**
   * Join a room by ID or alias
   */
  public async joinRoom(roomIdOrAlias: string): Promise<RoomSummary> {
    await this.waitForClient();
    if (!this.client) throw new Error("Client not initialized");

    console.debug(`[MatrixService] Joining room: ${roomIdOrAlias}`);
    const room = await this.client.joinRoom(roomIdOrAlias);
    const roomState = room.getLiveTimeline().getState(EventTimeline.FORWARDS);
    const topicEvent = roomState?.getStateEvents(EventType.RoomTopic, "");
    const topic = topicEvent?.getContent()?.topic;

    return {
      roomId: room.roomId,
      name: room.name,
      topic: topic,
    };
  }

  /**
   * Create a new room
   */
  public async createRoom(options: CreateRoomOptions): Promise<string> {
    await this.waitForClient();
    if (!this.client) throw new Error("Client not initialized");

    console.debug(`[MatrixService] Creating room: ${options.name}`);
    const { room_id } = await this.client.createRoom({
      preset:
        options.visibility === RoomVisibility.Private
          ? Preset.PrivateChat
          : Preset.PublicChat,
      visibility:
        options.visibility === RoomVisibility.Public
          ? Visibility.Public
          : Visibility.Private,
      name: options.name,
      topic: options.topic,
    });
    console.debug(`[MatrixService] Created room with ID: ${room_id}`);
    return room_id;
  }

  /**
   * Send a text message to a room
   */
  public async sendMessage(roomId: string, body: string): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");

    await this.client.sendEvent(
      roomId,
      EventType.RoomMessage,
      {
        msgtype: MsgType.Text,
        body: body,
      } as any,
      ""
    );
  }

  /**
   * Get list of joined rooms
   */
  public async getJoinedRooms(): Promise<RoomSummary[]> {
    await this.waitForClient();
    if (!this.client) return [];

    const rooms = this.client.getRooms();
    // Filter out rooms that are spaces
    const chatRooms = rooms.filter((room) => !room.isSpaceRoom()); //i want to get rooms not workspaces/spaces

    return chatRooms.map((room) => {
      const roomState = room.getLiveTimeline().getState(EventTimeline.FORWARDS);
      const topicEvent = roomState?.getStateEvents(EventType.RoomTopic, "");
      const topic = topicEvent?.getContent()?.topic;
      return {
        roomId: room.roomId,
        name: room.name,
        topic: topic,
      };
    });
  }

  /**
   * Load older messages from the server (pagination)
   */
  public async loadMoreMessages(
    roomId: string,
    limit: number = 20
  ): Promise<void> {
    if (!this.client) return;
    const room = this.client.getRoom(roomId);
    if (!room) return;

    console.debug(
      `[MatrixService] Loading ${limit} more messages for ${roomId}`
    );
    await this.client.scrollback(room, limit);
  }

  /**
   * Join or create a video call in a room
   * Uses MatrixRTC (Group Calls) for room-based video calls
   * If already in a call in another room, leaves that call first
   */
  public async joinCall(
    roomId: string
  ): Promise<{ callId: string; roomId: string }> {
    await this.waitForClient();
    if (!this.client || !this.callManager) {
      throw new Error("Client not initialized");
    }

    return await this.callManager.joinCall(roomId);
  }

  /**
   * Leave/end the current active call
   */
  public async leaveCall(): Promise<void> {
    if (!this.client || !this.callManager) {
      throw new Error("Client not initialized");
    }
    return await this.callManager.leaveCall();
  }

  /**
   * Get observable stream of user media streams for the current active call room
   * Returns a single observable that always emits streams for the currently active call
   * Emits empty array when no call is active
   */
  public getCallStreams$(): Observable<UserMediaStream[]> {
    if (!this.callManager) {
      throw new Error("Client not initialized");
    }
    return this.callManager.getCallStreams$();
  }

  /**
   * Toggle microphone mute state
   * @param muted - true to mute, false to unmute
   * @returns Promise<boolean> - true if successful
   */
  public async setMicrophoneMuted(muted: boolean): Promise<boolean> {
    if (!this.callManager) {
      throw new Error("Client not initialized");
    }
    this.callManager.toggleMic(muted);
    return true;
  }

  /**
   * Toggle video mute state
   * @param muted - true to mute, false to unmute
   * @returns Promise<boolean> - true if successful
   */
  public async setVideoMuted(muted: boolean): Promise<boolean> {
    if (!this.callManager) {
      throw new Error("Client not initialized");
    }
    this.callManager.toggleCam(muted);
    return true;
  }
  // =================================================================================================
  // PRIVATE METHODS
  // =================================================================================================

  private async start(loginResponse: LoginResponse): Promise<MatrixSession> {
    console.debug("[MatrixService] Starting client...");
    this.client = createClient({
      baseUrl: this.homeserverUrl,
      accessToken: loginResponse.access_token,
      deviceId: loginResponse.device_id,
      userId: loginResponse.user_id,
    });
    this.setupEventListeners();
    await this.client.startClient({ initialSyncLimit: 10 });

    // Initialize call manager with the client
    this.callManager = new CallManager(this.client);

    const session: MatrixSession = {
      userId: this.client.getUserId()!,
      accessToken: this.client.getAccessToken()!,
      deviceId: this.client.getDeviceId()!,
    };
    return session;
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    // Initialize the sync handler now that we have a client
    this.syncEventHandler = new SyncEventHandler(this.client, this.onTimeline);
    this.syncEventHandler.isReady$.subscribe(this._isClientReady$);

    // Attach the single, authoritative sync listener
    this.client.on(ClientEvent.Sync, this.syncEventHandler.onSync);
  }

  private onTimeline = (
    event: MatrixEvent,
    room: Room | undefined,
    toStartOfTimeline: boolean | undefined
  ) => {
    if (!room || toStartOfTimeline) return;
    for (const handler of this.timelineHandlers) {
      handler.handle(event);
    }
  };

  /**
   * Waits for the client to be in a state where it can perform actions.
   */
  private async waitForClient(): Promise<void> {
    // The public stream already holds the state, so we can use it directly.
    if (this._isClientReady$.getValue()) {
      return;
    }

    await firstValueFrom(
      this.isClientReady$.pipe(
        filter((isReady) => isReady),
        take(1)
      )
    );
  }

  /**
   * Fetches LiveKit credentials (token and url) by exchanging Matrix OpenID token
   * with the homeserver's discovered LiveKit JWT service (MSC4143).
   */
  private async fetchLiveKitCredentials(
    roomId: string
  ): Promise<LiveKitCredentials> {
    if (!this.client) throw new Error("Client not initialized");

    // 1. Discover LiveKit Service URL (if not cached)
    if (!this.liveKitServiceUrl) {
      console.log(
        "[MatrixService] Discovering LiveKit Service URL from homeserver..."
      );
      try {
        const wellKnownUrl = `${this.homeserverUrl}/.well-known/matrix/client`;
        const response = await fetch(wellKnownUrl);
        if (!response.ok)
          throw new Error(`Failed to fetch .well-known: ${response.status}`);

        const config = await response.json();
        const foci = config["org.matrix.msc4143.rtc_foci"];

        if (Array.isArray(foci)) {
          const liveKitConfig = foci.find((f: any) => f.type === "livekit");
          if (liveKitConfig && liveKitConfig.livekit_service_url) {
            this.liveKitServiceUrl = liveKitConfig.livekit_service_url;
            console.log(
              `[MatrixService] Discovered LiveKit Service URL: ${this.liveKitServiceUrl}`
            );
          }
        }

        // Fallback/Default for matrix.org if discovery fails or is missing
        if (
          !this.liveKitServiceUrl &&
          this.homeserverUrl.includes("matrix.org")
        ) {
          this.liveKitServiceUrl = "https://livekit-jwt.call.matrix.org";
          console.log(
            `[MatrixService] Using default matrix.org LiveKit Service URL: ${this.liveKitServiceUrl}`
          );
        }
      } catch (err) {
        console.warn("[MatrixService] Discovery failed, trying default:", err);
        // Fallback
        this.liveKitServiceUrl = "https://livekit-jwt.call.matrix.org";
      }
    }

    if (!this.liveKitServiceUrl) {
      throw new Error(
        "Could not discover LiveKit Service URL and no default available."
      );
    }

    // 2. Get OpenID Token from Matrix
    console.log("[MatrixService] Requesting OpenID token...");
    const openIdToken = await this.client.getOpenIdToken();

    // 3. Exchange OpenID for LiveKit Credentials
    // Endpoint typically /v1/token or /livekit/token
    const tokenEndpoint = `${this.liveKitServiceUrl}/v1/token`;

    console.log(
      `[MatrixService] Exchanging OpenID token at ${tokenEndpoint}...`
    );

    const exchangeResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: roomId,
        openid_token: openIdToken,
      }),
    });

    if (!exchangeResponse.ok) {
      const text = await exchangeResponse.text();
      throw new Error(
        `LiveKit token exchange failed (${exchangeResponse.status}): ${text}`
      );
    }

    const data = await exchangeResponse.json();
    console.log("[MatrixService] Received LiveKit credentials");

    return {
      token: data.token,
      livekit_service_url: data.service_url, // Note: this is the WSS url
    };
  }
}

export const matrixService = new MatrixService();
