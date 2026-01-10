import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAnwYUjq3o9tTMVkI0zRMgeMNGl_nB_lMs";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Dummy call to init if needed, actually specific list method:
        // SDK doesn't always have listModels exposed cleanly in all versions/envs, trying direct REST or check SDK docs strictly. 
        // Actually, let's use the explicit list method if available, or just fetch via REST as I did before.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.error("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
