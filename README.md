# A-OK RSS: Podcast RSS Hosting Platform

A modern podcast RSS hosting platform with AI-powered transcription and chapter generation.

## Features

- **Content Management System (CMS)**
  - Podcast management with artwork and descriptions
  - Episode management with audio uploads and metadata
  - Automatic metadata generation
  - Comprehensive podcast settings management
  - Episode filtering and sorting

- **Speech-to-Text (STT) and AI Integration**
  - Automated transcription using Cloudflare's Whisper V3 Turbo
  - AI-generated episode descriptions using Claude Sonnet 3.7
  - Smart chapter generation

- **RSS Feed Management**
  - Standard-compliant RSS XML generation
  - Automatic feed updates
  - Feed versioning and history
  - Podcast directory submission guidance

- **Analytics and Insights**
  - Download and listener statistics
  - Geographic distribution of audience
  - Episode performance metrics
  - Growth trends visualization

- **Chapter Tagging and Audio Player**
  - AI-generated chapter markers
  - Timestamped descriptions
  - Chapter information embedding
  - Feature-rich audio player with chapter support

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Convex for serverless database and functions
- **Storage**: 
  - Cloudflare R2 for audio files
  - Amazon S3 for artwork, transcripts, and RSS XML
- **AI Services**:
  - Cloudflare AI for transcription
  - Anthropic Claude for description and chapter generation
- **Analytics**: 
  - Custom analytics dashboard with Recharts
  - Data visualization components

## Key Components

- **PodcastForm**: Create and edit podcast details
- **EpisodeForm**: Create and edit episodes with audio upload
- **AudioPlayer**: Feature-rich player with chapter support
- **TranscriptViewer**: View and edit episode transcripts
- **PodcastAnalytics**: Dashboard for tracking podcast performance
- **PodcastSettings**: Comprehensive settings management
- **EpisodeList**: Display and filter podcast episodes
- **RssFeedInfo**: RSS feed management and submission links

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
CLOUDFLARE_ACCESS_KEY_ID=your_cloudflare_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_cloudflare_secret_key
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
R2_BUCKET_NAME=your_r2_bucket_name
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
R2_TOKEN=your_r2_token
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

3. Initialize and deploy to Convex:
   ```
   npx convex login
   npx convex init
   npx convex deploy
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Deploying to Convex

1. Login to Convex:
   ```
   npx convex login
   ```

2. Initialize your Convex project (if not already done):
   ```
   npx convex init
   ```

3. Deploy your Convex functions:
   ```
   npx convex deploy
   ```

### Deploying to Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

5. Set up environment variables in the Vercel dashboard, ensuring you add all the variables from your `.env.local` file.

### Using the Deployment Script

For convenience, you can use the included deployment script:

```
./deploy.sh
```

This script will:
1. Deploy your Convex functions
2. Deploy your Next.js application to Vercel
3. Set up the necessary environment variables

## Project Structure

- `/convex`: Convex backend functions and schema
  - `schema.ts`: Database schema definition
  - `podcasts.ts`: Podcast management functions
  - `episodes.ts`: Episode management functions
  - `rss.ts`: RSS feed generation functions
  - `/utils`: Utility functions including:
    - `xml.ts`: RSS feed XML generation
    - `r2.ts`: Cloudflare R2 integration
    - `s3.ts`: AWS S3 integration

- `/src`: Next.js frontend application
  - `/app`: Next.js app router pages
  - `/components`: Reusable UI components including:
    - `AudioPlayer.tsx`: Feature-rich audio player
    - `PodcastAnalytics.tsx`: Analytics dashboard
    - `PodcastSettings.tsx`: Settings management
    - `EpisodeList.tsx`: Episode listing and filtering
    - `TranscriptViewer.tsx`: Transcript display and editing

- `/public`: Static assets

## Usage

1. **Create a Podcast**: Start by creating a new podcast with basic information like title, author, and artwork.

2. **Add Episodes**: Upload audio files for your episodes, along with basic metadata.

3. **AI Processing**: The system will automatically transcribe your audio, generate chapters, and enhance descriptions.

4. **Manage Settings**: Configure podcast settings including distribution options and advanced configurations.

5. **Monitor Analytics**: Track your podcast's performance with the built-in analytics dashboard.

6. **RSS Feed**: Access your podcast's RSS feed URL to submit to podcast directories like Apple Podcasts, Spotify, etc.

## License

MIT

## Acknowledgements

- [Convex](https://www.convex.dev/) for the serverless backend
- [Next.js](https://nextjs.org/) for the React framework
- [Cloudflare AI](https://developers.cloudflare.com/workers-ai/) for transcription
- [Anthropic Claude](https://www.anthropic.com/) for AI text generation
- [Recharts](https://recharts.org/) for analytics visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling
