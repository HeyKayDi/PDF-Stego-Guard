import { GoogleGenAI } from "@google/genai";

// Manually declare the process so that TypeScript doesn't report errors when @types/node isn't installed.
declare const process: {
  env: {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
};

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please check your environment configuration.");
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
                        text: "Briefly summarize the main points of this PDF document in about 3-4 sentences. Please answer in Vietnamese."
                    }
                ]
            }
        });

        return response.text || "Content cannot be analyzed.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Error connecting to AI for file analysis. Ensure the file is not too large and the API key is valid.";
    }
};

export const analyzeHiddenFileContent = async (fileBytes: Uint8Array, mimeType: string, fileName: string): Promise<string> => {
    try {
        // This demo only supports image and text analysis to conserve tokens and ensure accuracy.
        if (!mimeType.startsWith('image/') && !mimeType.startsWith('text/') && mimeType !== 'application/pdf') {
            return `File "${fileName}" (${mimeType}) has been successfully extracted. Currently, AI only supports previewing text, PDF, or image content.`;
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
                        text: `This is a file extracted from a steganography technique. Please describe the content of this file briefly. If it's code, explain what the code does. Answer in Vietnamese.`
                    }
                ]
            }
        });

        return response.text || "Cannot analyze the content of the extracted file.";

    } catch (error) {
        console.error("Gemini Hidden Analysis Error:", error);
        return "File has been extracted but an error occurred while AI attempted to read its content.";
    }
}
