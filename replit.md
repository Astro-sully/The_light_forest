# YouTube Video Library Application

## Overview

This is a full-stack web application for managing a personal YouTube video library. Users can add YouTube channels by URL, and the app automatically fetches all longform videos from those channels. The application features a modern dark theme interface with embedded video playback capabilities for distraction-free viewing, completely eliminating YouTube Shorts and algorithmic suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL session store
- **API**: RESTful API endpoints for video CRUD operations

### Key Components

#### Database Schema
- **Channels Table**: Stores channel metadata (name, profileImage, channelId, description)
- **Videos Table**: Stores video metadata (title, videoId, channelName, URL, thumbnail, duration, publishedAt)
- **Users Table**: Basic user authentication (username, password)
- Database configured with Drizzle ORM using PostgreSQL dialect

#### API Endpoints
- `GET /api/channels` - Retrieve all channels
- `POST /api/channels` - Add new channel with automatic video fetching
- `GET /api/videos` - Retrieve all videos
- `GET /api/videos/channel/:channel` - Get videos by channel
- `DELETE /api/videos/:id` - Remove video from collection

#### Frontend Components
- **AddChannelForm**: Form for adding YouTube channels with URL validation
- **ChannelGrid**: Grid display of channel profile pictures
- **ChannelPage**: Dedicated page for browsing a channel's videos
- **VideoCard**: Individual video display with embedded YouTube player
- **Home**: Main page with channel grid
- Comprehensive UI component library from Shadcn/ui

### Data Flow

1. **Channel Addition**: User submits YouTube channel URL → API validates and fetches channel metadata → Channel stored in database → Background job fetches all longform videos → UI refresh
2. **Video Display**: Database query → API response → React Query cache → Component rendering with embedded players
3. **Video Removal**: User confirmation → API deletion → Database update → UI refresh

### External Dependencies

#### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking and validation
- **UI Components**: Radix UI primitives for accessible components
- **YouTube Integration**: YouTube-nocookie.com for embedded video players

#### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first styling framework
- **ESLint/Prettier**: Code formatting and linting (implied by structure)

### Deployment Strategy

#### Build Process
- Frontend: Vite builds to `dist/public` directory
- Backend: ESBuild bundles server code to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory

#### Environment Configuration
- Development: Uses `tsx` for TypeScript execution
- Production: Compiled JavaScript execution with Node.js
- Database: Environment variable `DATABASE_URL` for connection string

#### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon Database recommended)
- Static file serving capability for frontend assets
- Environment variable support for database configuration

### Architecture Decisions

#### Database Choice
- **Problem**: Need reliable, scalable data storage for video metadata
- **Solution**: PostgreSQL with Neon Database for serverless capabilities
- **Rationale**: Strong consistency, ACID compliance, and serverless scaling

#### ORM Selection
- **Problem**: Type-safe database operations with schema management
- **Solution**: Drizzle ORM with code-first schema definition
- **Rationale**: Excellent TypeScript integration and lightweight overhead

#### UI Framework
- **Problem**: Consistent, accessible, and modern user interface
- **Solution**: Shadcn/ui with Radix UI primitives and Tailwind CSS
- **Rationale**: High-quality components, accessibility built-in, and customizable theming

#### State Management
- **Problem**: Server state synchronization and caching
- **Solution**: TanStack Query for server state management
- **Rationale**: Automatic caching, background refetching, and optimistic updates

#### Monorepo Structure
- **Problem**: Shared types and schemas between frontend and backend
- **Solution**: Shared directory with common TypeScript definitions
- **Rationale**: Type safety across full stack and reduced code duplication

### Recent Changes

#### Production Ready (July 18, 2025)
- **Fixed**: Video fetching system now properly stores and displays videos
- **Resolved**: Channel name matching issues that prevented videos from appearing
- **Added**: Comprehensive debugging logs for video processing pipeline
- **Improved**: Automatic filtering of YouTube Shorts with detailed logging
- **Cleaned**: Removed all example/seed data for clean deployment
- **Status**: Application ready for production deployment

#### Channel-Centric Interface (July 18, 2025)
- **Changed**: Complete redesign from video-centric to channel-centric interface
- **Impact**: Users now add entire YouTube channels instead of individual videos
- **Benefits**: Eliminates manual video curation while maintaining distraction-free experience
- **Implementation**: 
  - Added channels table to store channel metadata
  - Integrated YouTube Data API for automatic channel and video fetching
  - Created channel grid interface with profile pictures
  - Built dedicated channel pages for video browsing
  - Implemented automatic filtering of YouTube Shorts (videos under 60 seconds)
  - Added background video fetching when channels are added