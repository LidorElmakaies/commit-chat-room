import { MatrixClient, SyncState, RoomEvent, Room } from "matrix-js-sdk";
import { BehaviorSubject } from "rxjs";

export class SyncEventHandler {
  private readonly _isReady$ = new BehaviorSubject<boolean>(false);
  public readonly isReady$ = this._isReady$.asObservable();

  public constructor(
    private client: MatrixClient,
    private onTimeline: (
      event: any,
      room: Room | undefined,
      toStartOfTimeline: boolean | undefined
    ) => void
  ) {}

  public onSync = (state: SyncState, prevState: SyncState | null) => {
    // Condition 1: When should the client be considered "Ready"?
    // When it's actively syncing or has just recovered.
    if (
      state === SyncState.Prepared ||
      state === SyncState.Syncing ||
      state === SyncState.Catchup
    ) {
      if (!this._isReady$.getValue()) {
        this._isReady$.next(true);
      }
    } else {
      if (this._isReady$.getValue()) {
        this._isReady$.next(false);
      }
    }

    // Condition 2: When should we run the expensive listener loop?
    // Only on initial setup or after recovering from a disconnect.
    if (state === SyncState.Prepared || state === SyncState.Catchup) {
      console.log(
        `[SyncEventHandler] State is ${state}. Re-attaching timeline listeners.`
      );
      const rooms = this.client.getRooms() || [];
      rooms.forEach((room) => {
        room.off(RoomEvent.Timeline, this.onTimeline);
        room.on(RoomEvent.Timeline, this.onTimeline);
      });
    }
  };
}
