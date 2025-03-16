// Use Node.js runtime for AI integrations
"use node";

import { Ai } from "@cloudflare/ai";
import { Anthropic } from "@anthropic-ai/sdk";

// Initialize Cloudflare AI with proper binding
export function getCloudflareAi(binding: any) {
  return new Ai(binding);
}

// Initialize Anthropic client
export function getAnthropicClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

// Transcribe audio using Cloudflare Whisper
export async function transcribeAudio(ai: Ai, audioBuffer: ArrayBuffer) {
  try {
    const inputs = {
      audio: Array.from(new Uint8Array(audioBuffer))
    };
    
    // Use the correct model name for Whisper
    const transcription = await ai.run('@cf/openai/whisper', inputs);
    
    return transcription.text || '';
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

// Generate text using Anthropic Claude
export async function generateText(anthropic: Anthropic, prompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error("Error generating text with Claude:", error);
    throw error;
  }
}

// Generate chapters from transcript using Claude
export async function generateChapters(transcript: string): Promise<Array<{ startTime: number; title: string; description?: string }>> {
  const client = getAnthropicClient(process.env.ANTHROPIC_API_KEY || "");

  const chapterPrompt = `
  You are an AI assistant helping to generate podcast chapters.
  Based on the following transcript, identify 3-7 distinct segments or topics and create timestamped chapters.
  For each chapter, provide a short, descriptive title and the timestamp where it begins.
  
  Transcript:
  ${transcript}
  
  Format your response as a JSON array with objects containing:
  - startTime (in seconds)
  - title (string)
  `;

  try {
    const response = await generateText(client, chapterPrompt);

    // Extract chapters from Claude's response
    const chaptersText = response.match(/\[[\s\S]*\]/)?.[0] || "[]";
    
    return JSON.parse(chaptersText);
  } catch (error) {
    console.error("Error generating chapters:", error);
    return [];
  }
}

// Generate enhanced description using Claude
export async function generateDescription(
  podcastTitle: string,
  episodeTitle: string,
  transcript: string,
  chapters: Array<{ startTime: number; title: string }>
): Promise<string> {
  const client = getAnthropicClient(process.env.ANTHROPIC_API_KEY || "");

  // Format chapter timestamps
  const formattedChapters = chapters.map(c => `(${formatTime(c.startTime)}) ${c.title}`).join('\n');
  
  const descriptionPrompt = `
  You are an AI assistant helping to generate podcast episode descriptions.
  Based on the following transcript and chapters, create a compelling episode description.
  Include the chapter timestamps in the format (HH:MM:SS) Chapter Title.
  
  Podcast: ${podcastTitle}
  Episode: ${episodeTitle}
  
  Transcript:
  ${transcript}
  
  Chapters:
  ${formattedChapters}
  
  Create a description that summarizes the episode content and highlights key points.
  The description should be engaging and informative, around 150-250 words.
  `;

  try {
    const response = await generateText(client, descriptionPrompt);
    
    return response;
  } catch (error) {
    console.error("Error generating description:", error);
    return "";
  }
}

// Helper function to format seconds as HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}
