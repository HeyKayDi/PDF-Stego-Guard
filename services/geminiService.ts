import { GoogleGenAI } from "@google/genai";

// Khai báo thủ công process để TypeScript không báo lỗi khi chưa cài @types/node
declare const process: {
  env: {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
};

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key không tìm thấy. Vui lòng kiểm tra cấu hình environment.");
    }
    return new GoogleGenAI({ apiKey });
}

export const analyzePdfContent = async (pdfFile: File): Promise<string> => {
    try {
        const client = getClient();
        const arrayBuffer = await pdfFile.arrayBuffer();
        const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: base64
                        }
                    },
                    {
                        text: "Hãy tóm tắt ngắn gọn nội dung chính của tài liệu PDF này trong khoảng 3-4 câu. Trả lời bằng tiếng Việt."
                    }
                ]
            }
        });

        return response.text || "Không thể phân tích nội dung.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Lỗi khi kết nối với AI để phân tích file. Đảm bảo file không quá lớn và API Key hợp lệ.";
    }
};

export const analyzeHiddenFileContent = async (fileBytes: Uint8Array, mimeType: string, fileName: string): Promise<string> => {
    try {
        // Chỉ hỗ trợ phân tích ảnh và text cho demo này để tiết kiệm token và đảm bảo độ chính xác
        if (!mimeType.startsWith('image/') && !mimeType.startsWith('text/') && mimeType !== 'application/pdf') {
            return `File "${fileName}" (${mimeType}) đã được trích xuất thành công. Hiện tại AI chỉ hỗ trợ xem trước nội dung Text, PDF hoặc Hình ảnh.`;
        }

        const client = getClient();
        const base64 = btoa(
            fileBytes.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64
                        }
                    },
                    {
                        text: `Đây là một file được trích xuất từ kỹ thuật ẩn giấu thông tin. Hãy mô tả nội dung file này một cách ngắn gọn. Nếu là code, hãy giải thích code làm gì. Trả lời bằng tiếng Việt.`
                    }
                ]
            }
        });

        return response.text || "Không thể phân tích nội dung file trích xuất.";

    } catch (error) {
        console.error("Gemini Hidden Analysis Error:", error);
        return "Đã trích xuất file nhưng lỗi khi AI cố gắng đọc nội dung.";
    }
}