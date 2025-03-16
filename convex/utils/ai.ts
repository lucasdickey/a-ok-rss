import { Ai } from "@cloudflare/ai";
import { Anthropic } from "@anthropic-ai/sdk";

// Initialize Cloudflare AI client
export function getCloudflareAI() {
  return new Ai();
}

// Initialize Anthropic Claude client
export function getClaude() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });
}

// Transcribe audio using Cloudflare Whisper
export async function transcribeAudio(audioUrl: string): Promise<string> {
  const ai = getCloudflareAI();
  
  try {
    const transcription = await ai.run("@cf/whisper/v3-turbo", {
      audio: audioUrl,
      output_format: "vtt",
    });
    
    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Generate chapters from transcript using Claude
export async function generateChapters(transcript: string): Promise<Array<{ startTime: number; title: string; description?: string }>> {
  const claude = getClaude();
  
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
    const response = await claude.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: chapterPrompt }],
    });

    // Extract chapters from Claude's response
    const chaptersText = response.content[0].text;
    const chaptersJson = chaptersText.match(/\[[\s\S]*\]/)?.[0] || "[]";
    
    return JSON.parse(chaptersJson);
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
  const claude = getClaude();
  
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
    const response = await claude.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: descriptionPrompt }],
    });

    return response.content[0].text;
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
