# A-OK RSS: Podcast RSS Hosting Platform

A modern podcast RSS hosting platform with AI-powered transcription and chapter generation.

## Features

- **Content Management System (CMS)**
  - Podcast management with artwork and descriptions
  - Episode management with audio uploads and metadata
  - Automatic metadata generation

- **Speech-to-Text (STT) and AI Integration**
  - Automated transcription using Cloudflare's Whisper V3 Turbo
  - AI-generated episode descriptions using Claude Sonnet 3.7
  - Smart chapter generation

- **RSS Feed Management**
  - Standard-compliant RSS XML generation
  - Automatic feed updates
  - Feed versioning and history

- **Chapter Tagging**
  - AI-generated chapter markers
  - Timestamped descriptions
  - Chapter information embedding

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Convex for serverless database and functions
- **Storage**: 
  - Cloudflare R2 for audio files
  - Amazon S3 for artwork, transcripts, and RSS XML
- **AI Services**:
  - Cloudflare AI for transcription
  - Anthropic Claude for description and chapter generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Convex account
- AWS account with S3 access
- Cloudflare account with R2 and AI access
- Anthropic API key

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/a-ok-rss.git
   cd a-ok-rss
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Initialize Convex:
   ```
   npx convex dev
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/convex`: Convex backend functions and schema
  - `schema.ts`: Database schema definition
  - `podcasts.ts`: Podcast management functions
  - `episodes.ts`: Episode management functions
  - `rss.ts`: RSS feed generation functions
  - `/utils`: Utility functions

- `/src`: Next.js frontend application
  - `/app`: Next.js app router pages
  - `/components`: Reusable UI components

- `/public`: Static assets

## Usage

1. **Create a Podcast**: Start by creating a new podcast with basic information like title, author, and artwork.

2. **Add Episodes**: Upload audio files for your episodes, along with basic metadata.

3. **AI Processing**: The system will automatically transcribe your audio, generate chapters, and enhance descriptions.

4. **RSS Feed**: Access your podcast's RSS feed URL to submit to podcast directories like Apple Podcasts, Spotify, etc.

## License

MIT

## Acknowledgements

- [Convex](https://www.convex.dev/) for the serverless backend
- [Next.js](https://nextjs.org/) for the React framework
- [Cloudflare AI](https://developers.cloudflare.com/workers-ai/) for transcription
- [Anthropic Claude](https://www.anthropic.com/) for AI text generation
