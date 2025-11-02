
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Summarizes the given text using the Gemini API.
 * @param articleText The text of the news article to summarize.
 * @returns A promise that resolves to the summarized text.
 */
export const summarizeText = async (articleText: string): Promise<string> => {
    try {
        const prompt = `Please summarize the following Telugu news article in clear and concise Telugu, within 3-4 sentences. The summary should capture the main points of the article.\n\nArticle:\n\n${articleText}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing text with Gemini API:", error);
        // Return a specific error message to be displayed in the UI
        return "Couldn't summarize this article due to an API error.";
    }
};
