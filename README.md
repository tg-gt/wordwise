# WordWise (AnimusWriter)

<div align="center">
  <h1>🌙⚡ AI-Powered Daily Pages with Jungian Psychology</h1>
  <p>Transform your stream-of-consciousness journaling into tweet-worthy insights</p>
  
  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#how-it-works"><strong>How It Works</strong></a> ·
    <a href="#deployment"><strong>Deployment</strong></a>
  </p>
</div>

## About

WordWise is an AI-powered writing assistant that transforms your daily pages journaling practice into actionable insights and shareable content. Using Carl Jung's psychological archetypes, the app provides two distinct AI personas - **Anima** (creative intuitive) and **Animus** (strategic challenger) - to help you process your raw thoughts into structured wisdom.

### The Daily Pages Method

Inspired by Julia Cameron's "The Artist's Way," daily pages are three pages of stream-of-consciousness writing done every morning. This practice:
- Clears mental clutter and creative blocks
- Accesses deeper patterns in your thinking
- Provides raw material for creative insights
- Serves as a foundation for self-reflection

## Features

### 🧠 **Dual AI Personas**
- **Anima (🌙)**: Provides intuitive wisdom, emotional insight, and creative encouragement
- **Animus (⚡)**: Offers strategic analysis, constructive challenges, and action-oriented feedback

### ✍️ **Smart Writing Tools**
- Real-time grammar and style checking
- Writing metrics and progress tracking
- Document management with auto-save
- Contextual AI feedback as you write

### 🐦 **Content Extraction**
- Transform journal entries into tweet-worthy insights
- Extract actionable strategies from raw thoughts
- Get feedback styled after thought leaders (Naval, Paul Graham, etc.)
- Identify recurring patterns and themes

### 📱 **Modern Interface**
- Clean, distraction-free writing environment
- Dark/light theme support
- Responsive design for all devices
- Intuitive document organization

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT integration
- **State Management**: Zustand
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account
- An OpenAI API key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd wordwise-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [database.new](https://database.new)
2. Run the migrations in `app/supabase/migrations/` to set up your database schema
3. Get your project URL and anon key from the API settings

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## How It Works

### 1. **Daily Pages Session**
- Open the writing interface (`/write`)
- Begin your stream-of-consciousness journaling
- Write freely without editing or censoring thoughts

### 2. **AI Analysis**
- **Anima** provides intuitive insights and creative patterns
- **Animus** extracts actionable strategies and challenges
- Get real-time feedback on grammar and style

### 3. **Content Extraction**
- Transform raw thoughts into shareable insights
- Generate tweet-worthy content from your journaling
- Identify themes and patterns across writing sessions

### 4. **Growth & Reflection**
- Build a consistent daily writing practice
- Track your writing metrics and progress
- Develop deeper self-awareness through AI feedback

## Project Structure

```
wordwise-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (AI services)
│   ├── auth/              # Authentication pages
│   ├── write/             # Main writing interface
│   └── supabase/          # Database migrations
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── writing/           # Writing-specific components
├── lib/                   # Utilities and services
│   ├── services/          # AI and data services
│   ├── stores/            # Zustand state management
│   └── supabase/          # Supabase client config
└── docs/                  # Documentation
```

## Key Components

- **WritingEditor**: Main text editor with AI integration
- **PersonaSelector**: Switch between Anima/Animus feedback
- **DocumentSidebar**: Manage and organize writing sessions
- **WritingStreak**: Track daily writing consistency

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with automatic builds and environment variable integration.

### Database Setup

Run the migrations in your Supabase project:

```sql
-- Found in app/supabase/migrations/
-- 001_initial_schema.sql - Basic auth and documents
-- 002_persona_schema.sql - AI persona preferences
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Philosophy

WordWise combines the therapeutic benefits of morning pages with modern AI assistance. By engaging with Jung's archetypal psychology through AI personas, users develop a richer understanding of their creative process and inner wisdom.

The app doesn't replace human insight but amplifies it - turning the raw material of daily journaling into structured wisdom for personal growth and creative expression.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to transform your daily pages?** Start your journey with AI-guided journaling and discover the insights hidden in your stream-of-consciousness writing.
