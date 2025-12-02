import { MatrixEvent } from "matrix-js-sdk";
import { Observable } from "rxjs";

/**
 * Defines the contract for an event handler class.
 * @template T The type of processed data this handler emits.
 */
export interface IEventHandler<T> {
  /**
   * The public output stream for this handler.
   * Components and services subscribe to this to receive processed data.
   */
  readonly stream$: Observable<T>;

  /**
   * Processes a raw Matrix event.
   * If the event is relevant, it will be processed and the result will be
   * emitted on the `stream$`.
   * @param event The raw Matrix event from the SDK.
   */
  handle(event: MatrixEvent): void;
}
