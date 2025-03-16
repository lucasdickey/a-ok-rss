# A-OK RSS - Podcast RSS Hosting Platform

This directory contains the Convex functions for the A-OK RSS podcast hosting platform. These serverless functions handle the backend logic for podcast management, episode processing, and RSS feed generation.

## Key Components

### Core Functions

- **Podcast Management**: CRUD operations for podcasts in `podcasts.ts`
- **Episode Management**: CRUD operations for episodes in `episodes.ts`, including AI-powered audio processing
- **RSS Feed Generation**: Functions in `rss.ts` to generate and publish podcast RSS feeds

### Utility Functions

- **AI Integration** (`utils/ai.ts`): 
  - Cloudflare Whisper V3 Turbo for audio transcription
  - Anthropic Claude for generating episode descriptions and chapters
- **Storage** (`utils/s3.ts`): Cloudflare R2 storage for audio files, images, and RSS feeds
- **XML Utilities** (`utils/xml.ts`): Tools for generating standard-compliant podcast RSS feeds

## AI Integration

We've integrated two powerful AI services:

1. **Cloudflare Whisper V3 Turbo** for audio transcription
   - Processes uploaded podcast audio files
   - Generates accurate text transcripts

2. **Anthropic Claude** for content generation
   - Creates podcast chapters based on transcripts
   - Generates enhanced episode descriptions

## Deployment

### Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
CLOUDFLARE_ACCESS_KEY_ID=<your-cloudflare-access-key>
CLOUDFLARE_SECRET_ACCESS_KEY=<your-cloudflare-secret>
CLOUDFLARE_R2_ENDPOINT=<your-r2-endpoint>
R2_BUCKET_NAME=<your-bucket-name>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
R2_TOKEN=<your-r2-token>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### Deployment Process

1. Configure your Convex project using `convex.json`
2. Deploy Convex functions using `npx convex deploy`
3. Deploy the Next.js frontend to Vercel, ensuring environment variables are set

See the main README.md for detailed deployment instructions.

## Recent Updates

- Fixed TypeScript errors in AI utility functions
- Improved audio transcription using Cloudflare Whisper V3 Turbo
- Enhanced scheduler function references using the Convex API
- Added proper type annotations to prevent TypeScript errors
- Implemented proper error handling in AI processing functions

## Architecture

The application follows a serverless architecture:

1. **Frontend**: Next.js React application
2. **Backend**: Convex serverless functions
3. **Storage**: Cloudflare R2 for media and feed storage
4. **AI Processing**: Cloudflare AI and Anthropic Claude

## Development Notes

- Use `npx convex dev` to run the development server
- Test AI integrations with small audio files first
- Ensure all environment variables are properly set
- Check the Convex dashboard for function execution logs
