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

4. **Important**: Make sure to add the "use node" directive at the top of any Convex function files that use Node.js APIs:
   - `convex/utils/xml.ts`
   - `convex/utils/ai.ts`
   - `convex/utils/r2.ts`
   - `convex/utils/s3.ts`
   - `convex/episodes.ts`
   - `convex/rss.ts`

### Convex Web UI Configuration

After deploying to Convex, you need to configure several settings in the Convex Web UI:

1. **Environment Variables**:
   - Log in to the [Convex dashboard](https://dashboard.convex.dev)
   - Select your project
   - Go to the "Settings" tab
   - Navigate to the "Environment Variables" section
   - Add all the environment variables listed in the Environment Setup section

2. **Storage Configuration**:
   - In the "Storage" tab, verify that your storage settings match your R2 bucket configuration
   - Ensure proper permissions are set for file uploads and downloads

3. **CORS Configuration**:
   - In the "Settings" tab, find the "CORS" section
   - Add your Vercel deployment URL to the allowed origins
   - Include `*` if you want to allow development from localhost

4. **Function Monitoring**:
   - After deployment, check the "Logs" tab to monitor for any runtime errors
   - Set up any alerts for critical errors

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

5. Set up environment variables in the Vercel dashboard, ensuring you add all the variables from your `.env.local` file, especially:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

### Using the Deployment Script

For convenience, you can use the included deployment script:

```
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Check if you're logged in to Convex and Vercel
2. Deploy your Convex functions
3. Extract the Convex URL for your production deployment
4. Deploy your Next.js application to Vercel
5. Set up the necessary environment variables

## Troubleshooting Deployment

### Common TypeScript Errors

If you encounter TypeScript errors during deployment, check the following:

1. **Node.js API Usage**: Ensure all Convex functions using Node.js APIs have the `"use node";` directive at the top of the file.

2. **Function References**: Make sure all scheduler function references use the proper format:
   ```typescript
   // Incorrect
   await ctx.scheduler.runAfter(0, "episodes:processAudio", { episodeId });
   
   // Correct
   import { processAudio } from "./episodes";
   await ctx.scheduler.runAfter(0, processAudio, { episodeId });
   ```

3. **Action Context**: In action functions, use `storage` instead of `db`:
   ```typescript
   // Incorrect in actions
   const episode = await ctx.db.get(args.episodeId);
   
   // Correct in actions
   const episode = await ctx.storage.get(args.episodeId);
   ```

4. **AI Integration**: Ensure proper initialization of AI services:
   ```typescript
   // Incorrect
   const ai = new Ai();
   
   // Correct
   const ai = new Ai(env.CLOUDFLARE_AI);
   ```

### Vercel Build Errors

If your Vercel build fails:

1. Check the build logs for specific errors
2. Ensure all environment variables are properly set in the Vercel dashboard
3. Verify that your `next.config.js` is properly configured
4. Make sure all dependencies are correctly listed in `package.json`

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
    - `ai.ts`: AI service integrations

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

5. **Monitor Analytics**: Track your podcast's performance through the analytics dashboard.

6. **Share Your RSS Feed**: Use the generated RSS feed URL to submit your podcast to directories like Apple Podcasts, Spotify, and Google Podcasts.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
