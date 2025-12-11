export enum AppMode {
  HOME = 'HOME',
  HIDE = 'HIDE',
  EXTRACT = 'EXTRACT'
}

export interface HiddenMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  timestamp: number;
}

export interface ExtractResult {
  metadata: HiddenMetadata;
  fileData: Uint8Array;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';
