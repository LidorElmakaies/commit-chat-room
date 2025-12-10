// Polyfills for Matrix SDK and LiveKit in React Native
import { decode, encode } from "base-64";
import { Buffer } from "buffer";
import "react-native-get-random-values";
// Import abort-controller polyfill for AbortController and AbortSignal
import "abort-controller/polyfill";

// Polyfill globals
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// Polyfill Buffer
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Polyfill Promise.withResolvers
// Required by matrix-js-sdk v39+
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Polyfill Event for LiveKit
// LiveKit uses browser Event API which doesn't exist in React Native
if (typeof global.Event === "undefined") {
  global.Event = class Event {
    type: string;
    target: any;
    currentTarget: any;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;

    constructor(type: string, eventInitDict?: any) {
      this.type = type;
      this.target = null;
      this.currentTarget = null;
      this.bubbles = eventInitDict?.bubbles || false;
      this.cancelable = eventInitDict?.cancelable || false;
      this.defaultPrevented = false;
    }

    preventDefault() {
      this.defaultPrevented = true;
    }

    stopPropagation() {}
    stopImmediatePropagation() {}
  } as any;
}
