<div align="center">
  <h1>⚔️ Git Gud</h1>
  <p><strong>Turn software development into a multiplayer RPG and generate a verified professional resume.</strong></p>
</div>

---

Git Gud is a gamified web platform that transforms your everyday coding activities into an epic adventure. Level up your developer profile, complete quests, join guilds, and conquer hackathons (Raid Bosses), all while automatically building a verified, professional resume from your achievements.

## ✨ Features

- **🛡️ Choose Your Class**: Start your journey as a Front-End Sorcerer, Back-End Berserker, or other specialized classes.
- **📈 Passive EXP Engine**: Earn EXP automatically by committing code, opening PRs, and getting them merged on GitHub.
- **📜 Quest Tavern**: Take on Solo Bounties created by admins. Submit your work and earn EXP and exclusive Badges.
- **🏰 Guilds & Hackathons (Raid Bosses)**: Team up with 2-4 players to form a Guild. Compete in time-boxed Hackathons for massive rewards, exclusive banners, and leaderboard glory.
- **💼 Auto-Resume Generation**: Toggle your Gamer Profile into "Professional Mode" to instantly map your RPG achievements to a clean, print-ready professional resume.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer)
- **Package Manager**: npm, pnpm, or yarn
- **Git**
- **GitHub Account** (for OAuth integration)
- **Supabase Account** (for PostgreSQL database and Auth)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/git-gud.git
   cd git-gud
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your Supabase and GitHub details.
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure your Supabase project is set up with the required database schema (Users, Quests, Submissions, Guilds, etc.) and GitHub OAuth is enabled.*

4. **Run the development server:**
   ```bash
   npm run dev
   # or yarn dev / pnpm dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions)

## 🗺️ Roadmap

- **Phase 1**: Project Setup & Database Foundation (Supabase Schema, RLS)
- **Phase 2**: GitHub Authentication & Gamer Profile UI
- **Phase 3**: Passive EXP Engine (GitHub API Polling & Crons)
- **Phase 4**: Quest Tavern (Solo Bounties & Admin Validation)
- **Phase 5**: Guild System & Hackathon Raid Bosses
- **Phase 6**: Professional Resume Export & UI Polish

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Level up by submitting a pull request to help us build the ultimate developer RPG.

## 📄 License

This project is licensed under the MIT License.
