export enum MessageType {
  Text = "m.text",
  Image = "m.image",
  File = "m.file",
  Notice = "m.notice",
  Emote = "m.emote",
}

export interface TextContent {
  type: MessageType.Text | MessageType.Notice | MessageType.Emote;
  body: string;
}

export interface ImageContent {
  type: MessageType.Image;
  body: string; // The filename
  url: string; // The mxc:// URL
  info?: {
    mimetype?: string;
    size?: number;
    w?: number;
    h?: number;
  };
}

export interface FileContent {
  type: MessageType.File;
  body: string; // The filename
  url: string; // The mxc:// URL
  info?: {
    mimetype?: string;
    size?: number;
  };
}

export type MessageContent = TextContent | ImageContent | FileContent;

export interface Message {
  id: string;
  roomId: string;
  sender: string;
  content: MessageContent;
  timestamp: number;
}

