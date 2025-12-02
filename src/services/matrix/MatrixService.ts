import {
  MatrixClient,
  createClient,
  MatrixEvent,
  Room,
  ClientEvent,
  Preset,
  Visibility,
  EventTimeline,
  EventType,
  MsgType,
  LoginResponse,
} from "matrix-js-sdk";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { filter, take } from "rxjs/operators";
import {
  LoginCredentials,
  MatrixSession,
  RoomSummary,
  CreateRoomOptions,
  RoomVisibility,
} from "../../types";
import { RoomMessageHandler } from "./handlers/roomMessageHandler";
import { SyncEventHandler } from "./handlers/syncEventHandler";
import { IEventHandler } from "./handlers/IEventHandler";
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
}

export const matrixService = new MatrixService();
