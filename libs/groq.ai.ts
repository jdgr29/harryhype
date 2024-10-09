import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

// Initialize the Groq SDK with your API key
const groq = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_AI_API_KEY!, // Ensure this is set in your environment
});

// Define the GroqAI function to handle the chat completion requests
export async function GroqAI(query: ChatCompletionMessageParam[]) {
  try {
    // Make the API request to get the chat completion
    const response = await groq.chat.completions.create({
      messages: query,
      model: "llama3-8b-8192", // Specify the model you want to use
    });

    // Return the response from the API
    return response.choices[0].message?.content;
  } catch (error) {
    // Log any errors for debugging
    console.error("Error in GroqAI function:", error);
    throw error; // Rethrow the error after logging it
  }
}
