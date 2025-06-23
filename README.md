
# Radio Milwaukee Playlist App

A modern, real-time playlist viewer for Radio Milwaukee stations (HYFIN and 88Nine) built with React, TypeScript, and Supabase. This application provides live playlist updates, historical song search, and embeddable widgets for websites.

## 🎵 Features

- **Live Playlist Updates**: Real-time display of currently playing songs
- **Historical Search**: Search through thousands of previously played songs
- **Multi-Station Support**: Switch between HYFIN and 88Nine radio stations
- **Date Range Filtering**: Find songs played within specific time periods
- **YouTube Integration**: Preview songs with embedded YouTube videos
- **Embeddable Widget**: Generate custom embed codes for websites
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smart Caching**: Optimized API usage with database caching for better performance

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🎯 How to Use

### Main Interface

1. **Station Selection**: Choose between HYFIN and 88Nine radio stations using the radio buttons
2. **Live Playlist**: View the most recently played songs with automatic updates every 10 seconds
3. **Search**: Use the search box to find specific artists or songs in the database
4. **Date Filtering**: Toggle date search to find songs played within specific time ranges
5. **Load More**: Click to see additional songs from the playlist history

### Search Functionality

- **Text Search**: Type any artist name or song title to search the entire database
- **Date Range Search**: Enable date filtering and select start/end dates
- **Combined Search**: Use both text and date filters together for precise results
- **Real-time vs Historical**: Live updates show current playlist, search shows historical data

### Embedding on Your Website

1. Visit the `/demo` page to access the embed generator
2. Configure your preferences:
   - Station (HYFIN or 88Nine)
   - Auto-updates (on/off)
   - Search functionality (show/hide)
   - Number of songs to display
   - Compact mode for smaller spaces
   - Height and theme options
3. Copy the generated HTML embed code
4. Paste it into your website's HTML where you want the playlist to appear

## 📱 Pages & Routes

- `/` - Main playlist interface with station selection
- `/demo` - Embed code generator with customization options
- `/embed` - Embeddable widget view (used in iframes)
- `/article` - Technical documentation and implementation details

## 🛠 Technical Details

### Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database + Edge Functions)
- **API Integration**: Spinitron API for live data
- **Caching**: Smart database caching for YouTube and playlist data
- **Real-time Updates**: React Query with automatic refetching

### Data Sources

- **Live Data**: Spinitron API for real-time playlist information
- **Historical Data**: Supabase database with indexed song history
- **YouTube Integration**: Cached YouTube search results for song previews
- **Station Information**: Multi-station support with dynamic data fetching

### Performance Optimizations

- Database indexing for fast search queries
- YouTube API quota optimization through persistent caching
- Smart refetch strategies (live vs. historical data)
- Responsive image loading and lazy loading
- Efficient state management with React Query

## 🎨 Customization

### Embed Widget Options

- **Station**: Choose between available radio stations
- **Auto-update**: Enable/disable live playlist updates
- **Search**: Show/hide search functionality
- **Max Items**: Control number of songs displayed (or unlimited)
- **Compact Mode**: Reduce spacing for smaller widgets
- **Height**: Set specific pixel height or auto-resize
- **Theme**: Light or dark theme support
- **Layout**: List or grid view options
- **Date Search**: Enable historical date filtering

### Styling

The app uses Tailwind CSS with a custom design system. Key design elements:

- Orange accent colors matching Radio Milwaukee branding
- Responsive grid and flex layouts
- Dark mode support
- Smooth animations and transitions
- Mobile-first responsive design

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup

The app uses Supabase for backend services. Make sure to configure your Supabase project with the required database tables and edge functions.

### Database Schema

Key tables:
- `songs` - Historical playlist data with full-text search
- `stations` - Radio station configuration
- `youtube_cache` - Cached YouTube search results

## 📊 API Usage

The app integrates with:
- **Spinitron API**: Live playlist data
- **YouTube Data API**: Song preview functionality (with smart caching)
- **Supabase**: Database operations and real-time subscriptions

## 🤝 Contributing

This is a Radio Milwaukee project. For contributions or issues, please contact the development team.

## 📄 License

Built with ❤️ for Radio Milwaukee by Tarik (the Architect)

## 🔗 Links

- **Live Demo**: View the app in action
- **Embed Generator**: `/demo` - Create custom embed codes
- **Technical Article**: `/article` - Detailed implementation guide
- **Radio Milwaukee**: Visit the official Radio Milwaukee website

---

**Project URL**: https://lovable.dev/projects/3363c8a3-a7d7-4e3e-aae5-529185ab3544
