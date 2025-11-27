// Polyfills for Matrix SDK in React Native
import { decode, encode } from "base-64";
import { Buffer } from "buffer";
import "react-native-get-random-values";

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
