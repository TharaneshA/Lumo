declare module 'recorder-js' {
    export default class Recorder {
      constructor(context: AudioContext, config?: object);
      init(stream: MediaStream): Promise<void>;
      start(): void;
      stop(): Promise<{ blob: Blob; buffer: AudioBuffer }>;
      clear(): void;
    }
  }
  