import { STEGO_MAGIC_START, STEGO_META_END } from "../constants";
import { HiddenMetadata, ExtractResult } from "../types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Chuyển đổi file thành Uint8Array
 */
export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
};

/**
 * Ghép nối các mảng byte lại với nhau
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
 * Tìm vị trí của chuỗi byte con trong chuỗi byte cha
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
 * Ẩn file dữ liệu vào cuối file PDF
 * Cấu trúc: [PDF Gốc] + [Magic Start] + [JSON Metadata] + [Meta End] + [Hidden File Data]
 */
export const embedFileInPdf = async (
  pdfFile: File,
  hiddenFile: File
): Promise<Blob> => {
  const pdfBytes = await fileToUint8Array(pdfFile);
  const hiddenBytes = await fileToUint8Array(hiddenFile);

  // Tạo metadata
  const metadata: HiddenMetadata = {
    fileName: hiddenFile.name,
    fileSize: hiddenFile.size,
    mimeType: hiddenFile.type,
    timestamp: Date.now(),
  };

  const magicStartBytes = encoder.encode(STEGO_MAGIC_START);
  const metadataBytes = encoder.encode(JSON.stringify(metadata));
  const metaEndBytes = encoder.encode(STEGO_META_END);

  // Kiểm tra xem PDF đã có dữ liệu ẩn chưa (để tránh lồng nhau quá nhiều hoặc lỗi)
  if (findSequence(pdfBytes, magicStartBytes) !== -1) {
    throw new Error("File PDF này dường như đã chứa dữ liệu ẩn.");
  }

  const finalBytes = concatenateBuffers([
    pdfBytes,
    magicStartBytes,
    metadataBytes,
    metaEndBytes,
    hiddenBytes,
  ]);

  // Ép kiểu as BlobPart để tránh lỗi strict typing của TS với Uint8Array
  return new Blob([finalBytes as BlobPart], { type: "application/pdf" });
};

/**
 * Trích xuất file ẩn từ PDF
 */
export const extractFileFromPdf = async (
  pdfFile: File
): Promise<ExtractResult> => {
  const pdfBytes = await fileToUint8Array(pdfFile);
  const magicStartBytes = encoder.encode(STEGO_MAGIC_START);
  const metaEndBytes = encoder.encode(STEGO_META_END);

  // 1. Tìm điểm bắt đầu
  const startIndex = findSequence(pdfBytes, magicStartBytes);
  if (startIndex === -1) {
    throw new Error("Không tìm thấy dữ liệu ẩn nào trong file PDF này.");
  }

  // 2. Tìm điểm kết thúc metadata (bắt đầu từ sau magic start)
  const metaStartPos = startIndex + magicStartBytes.length;
  // Cắt mảng từ vị trí metaStartPos để tìm metaEnd
  const remainingBytes = pdfBytes.slice(metaStartPos);
  const metaEndIndexRelative = findSequence(remainingBytes, metaEndBytes);
  
  if (metaEndIndexRelative === -1) {
    throw new Error("Cấu trúc dữ liệu ẩn bị hỏng (không thấy metadata end).");
  }

  const metaEndPos = metaStartPos + metaEndIndexRelative;
  
  // 3. Parse Metadata
  const metadataBytes = pdfBytes.slice(metaStartPos, metaEndPos);
  const metadataStr = decoder.decode(metadataBytes);
  let metadata: HiddenMetadata;
  
  try {
    metadata = JSON.parse(metadataStr);
  } catch (e) {
    throw new Error("Metadata bị hỏng, không thể đọc thông tin file.");
  }

  // 4. Lấy dữ liệu file
  const fileDataStart = metaEndPos + metaEndBytes.length;
  const fileData = pdfBytes.slice(fileDataStart);

  if (fileData.length !== metadata.fileSize) {
    console.warn("Kích thước file trích xuất không khớp với metadata, file có thể bị lỗi.");
  }

  return {
    metadata,
    fileData
  };
};

/**
 * Tải file xuống trình duyệt
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