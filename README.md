# Threads Clone

A modern social media application built with Next.js that allows users to post, reply, and interact with threads.

## 🚀 Features

- **Secure Telegram Authentication**: Token-based authentication system integrated with Telegram bot for enhanced security and simplified user experience
- **Well-Structured Architecture**: Clean code organization with clear separation of concerns following modern Next.js patterns
- **Type-Safe Implementation**: Comprehensive TypeScript usage throughout the codebase for improved reliability
- **Relational Database Design**: Carefully designed schema with proper relationships between users, posts, and interactions
- **Nested Replies System**: Support for threaded conversations with parent-child post relationships

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router & React 19
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Database**: DrizzleORM with Neon Postgres
- **Package Management**: Bun.js
- **Deployment**: Vercel

## 🔧 Getting Started

### Prerequisites

- Bun (or Node.js)
- Telegram bot credentials (for authentication)
- Neon Postgres database

### Environment Setup

Create a `.env.local` file with the following variables:

```
DATABASE_URL=your_neon_postgres_connection_string
BOT_TOKEN=your_telegram_bot_token
BOT_SECRET=your_telegram_webhook_secret
WEBSITE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AbdSattout/threads.git
   cd threads
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up the database:
   ```bash
   bun db:push
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Authentication Flow

1. User requests token from Telegram bot (`/auth` command)
2. Bot generates a one-time token and sends it to the user
3. User enters token on the login page
4. Application authenticates and creates a session

## 📚 Project Structure

```
threads/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable UI components
│   ├── db/               # Database schema and queries
│   ├── lib/              # Utility functions
│   └── auth.ts           # Authentication configuration
├── public/               # Static assets
└── ... configuration files
```

## 🧰 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Run production build
- `bun lint` - Run ESLint
- `bun db:push` - Push schema changes to database
- `bun db:migrate` - Run database migrations
- `bun db:generate` - Generate migration files
- `bun db:studio` - Open Drizzle Studio (database UI)

## 📝 Development Status

- [x] Scaffold the app
- [x] Setup Database with DrizzleORM and Neon Postgres
- [x] Configure NextAuth with custom credentials provider
- [x] Implement authentication with Telegram
- [x] Create posts and likes schema
- [x] Implement CRUD operations for posts and likes
- [ ] Move off of NextAuth and implement custom authentication
- [ ] Add posting and liking functionality

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 👤 Author

Abd Sattout - [Telegram](https://t.me/AbdSattout)
