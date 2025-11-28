import {
  ClientEvent,
  createClient,
  EventType,
  MatrixClient,
  MatrixEvent,
  MsgType,
  Room,
  RoomEvent,
  RoomMember,
  RoomMemberEvent,
  SyncState,
  SyncStateData,
} from "matrix-js-sdk";
import { BehaviorSubject, Subject } from "rxjs";

/**
 * Matrix Service
 *
 * Wrapper around matrix-js-sdk to handle:
 * - Client initialization & authentication
 * - Sync loop management
 * - Room events (messages, membership)
 * - Error handling
 */
export class MatrixService {
  private client: MatrixClient | null = null;
  private homeserverUrl: string;

  // Observables
  public authIsLoaded$ = new BehaviorSubject<boolean>(false);
  public syncState$ = new BehaviorSubject<SyncState | null>(null);
  public roomMessage$ = new Subject<{ event: MatrixEvent; room: Room }>();
  public roomMember$ = new Subject<{
    event: MatrixEvent;
    member: RoomMember;
  }>();

  constructor(homeserverUrl: string = "https://matrix.org") {
    this.homeserverUrl = homeserverUrl;
  }

  // =================================================================================================
  // PUBLIC API
  // =================================================================================================

  /**
   * Get current client instance (for direct access if needed)
   */
  public getClient(): MatrixClient | null {
    return this.client;
  }

  /**
   * Logout and clean up
   */
  public async logout(): Promise<void> {
    this.stop();
    if (this.client) {
      await this.client.logout();
      this.client = null;
    }

    // Reset state
    this.authIsLoaded$.next(false);
    this.syncState$.next(null);
    console.debug("[MatrixService] Logged out and state reset");
  }

  /**
   * Initialize and login a new client
   */
  public async login(
    username: string,
    password: string
  ): Promise<{
    userId: string;
    accessToken: string;
    deviceId: string;
  }> {
    console.debug("[MatrixService] Creating client...");

    // Create temporary client for login
    const tempClient = createClient({
      baseUrl: this.homeserverUrl,
    });

    try {
      console.debug("[MatrixService] Logging in...");
      // Per deprecation warning, use loginRequest for password login
      // to avoid side effects on the client instance
      const loginResult = await tempClient.loginRequest({
        type: "m.login.password",
        user: username,
        password: password,
      });

      console.debug(
        "[MatrixService] Login successful, initializing full client"
      );

      // Initialize full client with access token
      this.client = createClient({
        baseUrl: this.homeserverUrl,
        accessToken: loginResult.access_token,
        userId: loginResult.user_id,
        deviceId: loginResult.device_id,
      });

      this.setupEventListeners();

      // Auto-start sync
      await this.start();

      this.authIsLoaded$.next(true);

      return {
        userId: loginResult.user_id,
        accessToken: loginResult.access_token,
        deviceId: loginResult.device_id,
      };
    } catch (error) {
      console.error("[MatrixService] Login failed:", error);
      throw error;
    }
  }

  /**
   * Login with existing access token (Restoring session)
   */
  public async loginWithToken(
    userId: string,
    accessToken: string,
    deviceId: string
  ): Promise<void> {
    console.debug("[MatrixService] Restoring session with token...");

    this.client = createClient({
      baseUrl: this.homeserverUrl,
      accessToken: accessToken,
      userId: userId,
      deviceId: deviceId,
    });

    this.setupEventListeners();

    // Auto-start sync
    await this.start();

    this.authIsLoaded$.next(true);
    console.debug("[MatrixService] Session restored");
  }

  /**
   * Join a room by ID or alias
   */
  public async joinRoom(roomIdOrAlias: string): Promise<Room> {
    if (!this.client) throw new Error("Client not initialized");

    console.debug(`[MatrixService] Joining room: ${roomIdOrAlias}`);
    const room = await this.client.joinRoom(roomIdOrAlias);
    console.debug(`[MatrixService] Joined room: ${room.roomId}`);
    return room;
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
  public getJoinedRooms(): Room[] {
    if (!this.client) return [];
    return this.client.getRooms();
  }

  /**
   * Get room messages (history)
   */
  public async getRoomMessages(roomId: string): Promise<MatrixEvent[]> {
    if (!this.client) return [];

    const room = this.client.getRoom(roomId);
    if (!room) return [];

    // Get events from memory (timeline)
    // This gets the most recent events
    return room.getLiveTimeline().getEvents();
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

  // =================================================================================================
  // PRIVATE METHODS
  // =================================================================================================

  /**
   * Start the sync loop
   */
  private async start(): Promise<void> {
    if (!this.client)
      throw new Error("Client not initialized. Call login() first.");

    console.debug("[MatrixService] Starting sync...");
    await this.client.startClient({ initialSyncLimit: undefined });
  }

  /**
   * Stop the sync loop
   */
  private stop(): void {
    if (this.client) {
      console.debug("[MatrixService] Stopping client...");
      this.client.stopClient();
    }
  }

  /**
   * Internal event setup
   */
  private setupEventListeners() {
    if (!this.client) return;

    // Sync state changes
    this.client.on(
      ClientEvent.Sync,
      (state: SyncState, prevState: SyncState | null, data?: SyncStateData) => {
        if (state !== prevState) {
          console.debug(`[MatrixService] Sync state: ${state}`);
          this.syncState$.next(state);
        }
      }
    );

    // Room timeline events (messages)
    this.client.on(
      RoomEvent.Timeline,
      (
        event: MatrixEvent,
        room: Room | undefined,
        toStartOfTimeline: boolean | undefined
      ) => {
        if (!room || toStartOfTimeline) return;

        if (event.getType() === EventType.RoomMessage) {
          console.debug(
            `[MatrixService] New message in ${room.name}:`,
            event.getContent().body
          );
          this.roomMessage$.next({ event, room });
        }
      }
    );

    // Room membership changes
    this.client.on(
      RoomMemberEvent.Membership,
      (event: MatrixEvent, member: RoomMember) => {
        console.debug(
          `[MatrixService] Member update: ${member.name} (${member.membership})`
        );
        this.roomMember$.next({ event, member });
      }
    );
  }
}

// Export singleton instance
export const matrixService = new MatrixService();
