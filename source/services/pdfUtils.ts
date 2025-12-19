import { STEGO_MAGIC_START, STEGO_META_END } from "../constants";
import { HiddenMetadata, ExtractResult } from "../types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Convert the file to Uint8Array
 */
export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
};

/**
 * Concatenate multiple byte arrays
 */
const concatenateBuffers = (buffers: Uint8Array[]): Uint8Array => {
  let totalLength = 0;
  for (const buffer of buffers) {
    totalLength += buffer.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
};

/**
 * Find the position of the substring within the parent string
 */
const findSequence = (source: Uint8Array, sequence: Uint8Array): number => {
  if (sequence.length === 0) return -1;
  if (source.length < sequence.length) return -1;

  for (let i = 0; i < source.length - sequence.length + 1; i++) {
    let found = true;
    for (let j = 0; j < sequence.length; j++) {
      if (source[i + j] !== sequence[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
};

/**
 * Hide data files at the end of the PDF file
 * Structure: [Original PDF] + [Magic Start] + [JSON Metadata] + [Meta End] + [Hidden File Data]
 */
export const embedFileInPdf = async (
  pdfFile: File,
  hiddenFile: File
): Promise<Blob> => {
  const pdfBytes = await fileToUint8Array(pdfFile);
  const hiddenBytes = await fileToUint8Array(hiddenFile);

  // Create metadata
  const metadata: HiddenMetadata = {
    fileName: hiddenFile.name,
    fileSize: hiddenFile.size,
    mimeType: hiddenFile.type,
    timestamp: Date.now(),
  };

  const magicStartBytes = encoder.encode(STEGO_MAGIC_START);
  const metadataBytes = encoder.encode(JSON.stringify(metadata));
  const metaEndBytes = encoder.encode(STEGO_META_END);

  // Check if the PDF contains any hidden data (to avoid excessive nesting or errors)
  if (findSequence(pdfBytes, magicStartBytes) !== -1) {
    throw new Error("This PDF file appears to contain hidden data.");
  }

  const finalBytes = concatenateBuffers([
    pdfBytes,
    magicStartBytes,
    metadataBytes,
    metaEndBytes,
    hiddenBytes,
  ]);

  // Casting to BlobPart style avoids TS's strict typing error with Uint8Array
  return new Blob([finalBytes as BlobPart], { type: "application/pdf" });
};

/**
 * Extract hidden files from PDF
 */
export const extractFileFromPdf = async (
  pdfFile: File
): Promise<ExtractResult> => {
  const pdfBytes = await fileToUint8Array(pdfFile);
  const magicStartBytes = encoder.encode(STEGO_MAGIC_START);
  const metaEndBytes = encoder.encode(STEGO_META_END);

  // 1. Find the start position
  const startIndex = findSequence(pdfBytes, magicStartBytes);
  if (startIndex === -1) {
    throw new Error("No hidden data found in this PDF file.");
  }

  // 2. Find the end position of metadata (starting from after magic start)
  const metaStartPos = startIndex + magicStartBytes.length;
  // Slice the array from metaStartPos to find metaEnd
  const remainingBytes = pdfBytes.slice(metaStartPos);
  const metaEndIndexRelative = findSequence(remainingBytes, metaEndBytes);
  
  if (metaEndIndexRelative === -1) {
    throw new Error("The hidden data structure is corrupted (end metadata is not visible).");
  }

  const metaEndPos = metaStartPos + metaEndIndexRelative;
  
  // 3. Parse Metadata
  const metadataBytes = pdfBytes.slice(metaStartPos, metaEndPos);
  const metadataStr = decoder.decode(metadataBytes);
  let metadata: HiddenMetadata;
  
  try {
    metadata = JSON.parse(metadataStr);
  } catch (e) {
    throw new Error("Metadata is corrupted, cannot read file information.");
  }

  // 4. Get file data
  const fileDataStart = metaEndPos + metaEndBytes.length;
  const fileData = pdfBytes.slice(fileDataStart);

  if (fileData.length !== metadata.fileSize) {
    console.warn("The size of the extracted file does not match the metadata; the file may be corrupted.");
  }

  return {
    metadata,
    fileData
  };
};

/**
 * Download the file to your browser
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
