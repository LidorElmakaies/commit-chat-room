import { EventType, MatrixEvent } from "matrix-js-sdk";
import { Observable, Subject } from "rxjs";
import { Message, MessageContent, MessageType } from "../../../types";
import { IEventHandler } from "./IEventHandler";

export class RoomMessageHandler implements IEventHandler<Message> {
  // A private Subject to control the data flow internally.
  private readonly subject$ = new Subject<Message>();

  // The public-facing stream. Consumers can subscribe but cannot push new values.
  public readonly stream$: Observable<Message> = this.subject$.asObservable();

  public handle(event: MatrixEvent): void {
    if (event.getType() !== EventType.RoomMessage) {
      return; // This handler only cares about m.room.message events.
    }

    // --- All the message parsing logic from before ---
    const eventContent = event.getContent();
    const msgtype = eventContent.msgtype as MessageType;
    let content: MessageContent | null = null;

    switch (msgtype) {
      case MessageType.Text:
      case MessageType.Notice:
      case MessageType.Emote:
        content = {
          type: msgtype,
          body: eventContent.body,
        };
        break;

      case MessageType.Image:
        content = {
          type: MessageType.Image,
          body: eventContent.body,
          url: eventContent.url,
          info: eventContent.info,
        };
        break;

      case MessageType.File:
        content = {
          type: MessageType.File,
          body: eventContent.body,
          url: eventContent.url,
          info: eventContent.info,
        };
        break;

      default:
        console.log(`[RoomMessageHandler] Unhandled msgtype: ${msgtype}`);
        return;
    }

    if (content) {
      const message: Message = {
        id: event.getId()!,
        roomId: event.getRoomId()!,
        sender: event.getSender()!,
        content: content,
        timestamp: event.getTs(),
      };

      // Emit the processed message on our private subject.
      this.subject$.next(message);
    }
  }
}
