import { action } from "./_generated/server";
import { v } from "convex/values";

export const getSignedUrl = action({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, { agentId }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error("ElevenLabs API key not configured on server");
    }

    try {
      console.log(`Requesting signed URL for agent: ${agentId}`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": apiKey,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API Error:`, {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          agentId,
        });

        let errorMessage = `Failed to get signed URL: ${response.statusText}`;

        // Provide more specific error messages based on status codes
        switch (response.status) {
          case 401:
            errorMessage =
              "Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY environment variable.";
            break;
          case 404:
            errorMessage = `Agent not found. Please check your NEXT_PUBLIC_ELEVENLABS_AGENT_ID (${agentId}) is correct.`;
            break;
          case 429:
            errorMessage =
              "Rate limit exceeded. Please try again later or check your ElevenLabs quota.";
            break;
          case 500:
            errorMessage = "ElevenLabs server error. Please try again later.";
            break;
          default:
            errorMessage = `ElevenLabs API error (${response.status}): ${errorText || response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Successfully obtained signed URL from ElevenLabs");

      return data;
    } catch (error) {
      console.error("Error getting ElevenLabs signed URL:", error);
      throw error;
    }
  },
});
