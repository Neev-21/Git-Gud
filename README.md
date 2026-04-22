<div align="center">
  <h1>⚔️ Git Gud</h1>
  <p><strong>Turn your code into an adventure. Level up, conquer quests, join guilds, and generate a verified resume — all from your GitHub activity.</strong></p>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  </p>
</div>

---

Git Gud is a gamified web platform that transforms everyday coding into a multiplayer RPG. Earn EXP from real GitHub commits, complete admin-created quests, form guilds, battle in time-limited raids, climb the leaderboard, and auto-generate a professional resume from your achievements.

## Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Routes & Pages](#-routes--pages)
- [Getting Started](#-getting-started)
- [Admin Guide](#-admin-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Onboarding

- **GitHub OAuth** — One-click login via GitHub. No passwords, no forms.
- **Class Selection** — First-time users choose an RPG class that defines their developer identity:
  - Frontend Mage, Backend Knight, Full-Stack Paladin, DevOps Ranger, or Data Sorcerer
- **Automatic Profile Creation** — On first login, a profile is seeded from the user's GitHub data (avatar, username).

### 🧙 RPG Character Profile (`/profile`)

- **Character Sheet UI** — Dark-themed gamer card showing avatar, level, class, EXP bar, and equipped badges.
- **Level & EXP System** — EXP accumulates from GitHub activity, quests, and raids. Level is calculated from total EXP thresholds (100 EXP per level).
- **Badge Showcase** — Earned badges displayed as collectible items with rarity tiers (Common, Rare, Legendary) and glow effects.
- **Guild Affiliation** — Shows current guild name, banner, and role (Leader/Member) with a link to the guild page.
- **Navigation Hub** — Quick links to Tavern, Guilds, Raids, Leaderboard, and Admin (if admin).

### 📈 Passive EXP Engine

- **GitHub Activity Tracking** — A cron job (`/api/cron/sync-github`) periodically polls each user's public GitHub activity via the GitHub REST API.
- **EXP Rewards**:
  - `PushEvent` (commits): **10 EXP** per event
  - `PullRequestEvent` (opened): **25 EXP**
  - `PullRequestEvent` (merged): **50 EXP**
- **Daily Cap** — Maximum **200 EXP per day** from passive GitHub activity to prevent gaming.
- **Automatic Level-Up** — Profiles are updated with new EXP totals and level recalculated automatically.

### 📜 Quest Tavern (`/tavern`)

The Quest Tavern is a bounty board where users accept coding challenges created by admins.

- **Quest Board** — Browse available quests with difficulty indicators:
  - ⚪ **Common** (starter tasks)
  - 🟣 **Rare** (intermediate challenges)
  - 🟡 **Legendary** (advanced projects)
- **Quest Details** — Each quest shows title, description, EXP reward, optional badge reward, difficulty, and completion count.
- **Submission Workflow**:
  1. User clicks "Accept Quest"
  2. Submits a GitHub repo/PR URL
  3. Admin reviews and approves/rejects
  4. On approval: EXP is awarded, badge is granted (if applicable), completion count increments
- **Max Completions** — Quests can optionally limit how many users can complete them.

### 🏅 Badge System

- **Rarity Tiers** — Badges have rarity levels with distinct visual styles:
  - **Common** — Blue border, subtle glow
  - **Rare** — Purple border, medium glow
  - **Legendary** — Amber border, strong golden glow
- **Image Upload** — Admins upload custom badge images directly via the dashboard (stored in Supabase Storage `badge-images` bucket).
- **Auto-Award** — Badges can be linked to quests and automatically awarded on quest approval.
- **Profile Display** — Badges appear on the user's character sheet and public profile.

### 🏰 Guild System (`/guilds`, `/guilds/[id]`)

- **Create a Guild** — Any user can create a guild with a name, description, and banner image upload.
- **Join/Leave** — Users can be part of **one guild at a time**. Join with a click, leave anytime.
- **Roles** — Creator becomes the **Leader**. All others are **Members**.
- **Guild Detail Page** — Shows banner, member roster with roles, and guild stats.
- **Guild-Only Features** — Raids require guild membership for participation.

### 🔥 Guild Raids (`/raids`, `/raids/[id]`)

Raids are time-limited competitive events where guilds battle for EXP and glory.

- **Raid Lifecycle** (4 states):

  | State | Description |
  |---|---|
  | ⏳ **Upcoming** | Countdown to start. No submissions. |
  | 🔥 **Active** | Guild leaders can submit a GitHub repo URL. |
  | ⚖️ **Judging** | Submissions closed. Admins score entries. |
  | 🏆 **Finalized** | Podium revealed. EXP distributed. |

- **Guild-Only Submissions** — Only guild **leaders** can submit entries on behalf of their guild.
- **EXP Tier System** — Base EXP set by admin, multiplied by placement:

  | Placement | Multiplier | Example (base=500) |
  |---|---|---|
  | 🥇 1st Place | 3× | 1,500 EXP |
  | 🥈 2nd Place | 2× | 1,000 EXP |
  | 🥉 3rd Place | 1.5× | 750 EXP |
  | 🏰 Participant | 1× | 500 EXP |

- **EXP Distribution** — When the admin finalizes a raid, EXP is distributed to **all members** of each participating guild (not just the leader).
- **Raid Detail Page** — Shows banner, countdown timer, mission brief, EXP tier table, submission leaderboard with scores, and a personalized result card ("Your guild placed 2nd! +1,000 EXP").

### 🏆 Leaderboard (`/leaderboard`)

- **Dual Tabs** — Switch between **Players** and **Guilds** rankings.
- **Player Leaderboard** — Ranked by total EXP. Shows avatar, username, level, class, and guild. Top 3 get 🥇🥈🥉 medals.
- **Guild Leaderboard** — Ranked by combined member EXP. Shows banner, name, member count, and leader.
- **Current User Highlight** — Your row is highlighted with a blue glow so you can quickly find your rank.

### 👤 Public Profiles (`/u/[username]`)

- **Shareable Profiles** — Each user has a public URL (`/u/username`) accessible without login.
- **Read-Only View** — Shows avatar, level, class, guild affiliation, badge collection, and quest stats.
- **Link to Resume** — Quick link to generate the printable resume.

### 📄 Resume Export (`/resume/[username]`)

- **Professional Format** — Clean white layout that maps RPG data to professional resume sections:
  - RPG Class → Professional Title (e.g., "Frontend Mage" → "Frontend Developer")
  - Badges → Skills & Certifications
  - Completed Quests → Projects & Achievements (with difficulty mapped to Starter/Intermediate/Advanced)
  - Guild → Team Experience
  - Level + EXP + join date → Summary
- **Print to PDF** — One-click "📄 Print / Save PDF" button. Uses `@media print` CSS for clean output.
- **Public Access** — No login required.

### 🏠 Landing Page (`/`)

- **Marketing Homepage** — Animated hero section with gradient text, background particle effects, and a compelling CTA.
- **Live Platform Stats** — Animated count-up numbers showing total Adventurers, Guilds, Quests Completed, and Total EXP.
- **Feature Cards** — Visual breakdown of the platform's 4 pillars (Profile, Quests, Guilds, Raids).
- **Activity Feed** — Real-time feed of recent badge awards across the platform.
- **Smart CTA** — Shows "Sign in with GitHub" for visitors, "Enter the Game" for logged-in users.

### 🛡️ Admin Dashboard (`/admin`)

A full management console with 5 tabs:

| Tab | Features |
|---|---|
| **Quests** | Create quests (title, description, difficulty, EXP, badge reward, max completions). Edit status (active/closed). Delete. |
| **Submissions** | Review quest submissions. Approve (awards EXP + badge) or reject with notes. Filter by status. |
| **Badges** | Create badges with name, description, rarity, and image upload. Delete badges. |
| **Raids** | Create raids (title, dates, EXP, max teams). Close submissions. Score entries. Finalize & Release EXP with confirmation preview. |
| **Users** | View all users. Toggle admin privileges. See level, class, and EXP. |

---

## 🏗 Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page (server) + LandingPage.tsx (client)
│   ├── login/                # GitHub OAuth login page
│   ├── onboarding/           # Class selection for new users
│   ├── auth/callback/        # OAuth callback handler
│   ├── profile/              # RPG character sheet (server + ProfileClient)
│   ├── u/[username]/         # Public profile (server + PublicProfile)
│   ├── resume/[username]/    # Printable resume (server + ResumeView)
│   ├── tavern/               # Quest board (server + QuestBoard)
│   ├── guilds/               # Guild listing (server + GuildList)
│   │   └── [id]/             # Guild detail (server + GuildDetail)
│   ├── raids/                # Raid board (server + RaidBoard)
│   │   └── [id]/             # Raid detail (server + RaidDetail)
│   ├── leaderboard/          # Player/Guild rankings
│   ├── admin/                # Admin dashboard (server + AdminDashboard)
│   │   └── actions.ts        # All server actions (quests, badges, raids, users)
│   └── api/cron/sync-github/ # Cron endpoint for passive EXP
├── utils/
│   ├── supabase/             # Supabase client (server, client, middleware)
│   └── github.ts             # GitHub API integration
└── middleware.ts              # Auth + route protection
```

### Key Patterns

- **Server Components** fetch data, **Client Components** handle interactivity
- **Server Actions** for all mutations (no API routes except cron)
- **Middleware** protects routes — public routes: `/`, `/u/`, `/resume/`, `/leaderboard`, `/login`, `/auth`, `/api`
- **Row-Level Security (RLS)** on all Supabase tables

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GitHub OAuth) |
| Storage | Supabase Storage (badge/guild images) |
| Deployment | Vercel-ready |

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User data: username, avatar, level, exp, class, is_admin, show_on_leaderboard |
| `quests` | Admin-created bounties with difficulty, EXP, badge reward, max completions |
| `submissions` | User quest submissions with status (pending/submitted/approved/rejected) |
| `badges` | Collectible badges with name, description, rarity, image |
| `user_badges` | Junction table linking users to earned badges |
| `guilds` | Teams with name, description, banner image |
| `guild_members` | Guild membership with role (leader/member) |
| `hackathons` | Raids with dates, EXP, max teams, is_finalized flag |
| `hackathon_submissions` | Guild raid entries with score, placement (1/2/3), review notes |

---

## 🗺 Routes & Pages

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Marketing landing page with live stats |
| `/login` | Public | GitHub OAuth login |
| `/onboarding` | Auth | Class selection (first-time users) |
| `/profile` | Auth | RPG character sheet |
| `/tavern` | Auth | Quest board — browse & submit |
| `/guilds` | Auth | Guild listing — create & join |
| `/guilds/[id]` | Auth | Guild detail — members, banner |
| `/raids` | Auth | Raid board — active, judging, completed |
| `/raids/[id]` | Auth | Raid detail — countdown, submit, podium |
| `/leaderboard` | Public | Player & guild rankings |
| `/u/[username]` | Public | Public profile — shareable |
| `/resume/[username]` | Public | Printable resume — PDF export |
| `/admin` | Admin | Full management dashboard |
| `/api/cron/sync-github` | API | Cron job for passive EXP |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** / **pnpm** / **yarn**
- **GitHub Account** (for OAuth)
- **Supabase Account** (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/Neev-21/Git-Gud.git
cd Git-Gud

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GITHUB_TOKEN=your_github_personal_access_token
```

### Supabase Setup

1. Create a new Supabase project
2. Enable GitHub OAuth in Authentication → Providers
3. Run the database migrations (tables, RLS policies, storage buckets)
4. Create a `badge-images` storage bucket with public access

### Run

```bash
npm run dev
```

Open [http://localhost:6969](http://localhost:6969) in your browser.

---

## 🛡️ Admin Guide

### Making Yourself Admin

After first login, run this SQL in the Supabase SQL editor:

```sql
UPDATE profiles SET is_admin = true WHERE username = 'your-github-username';
```

### Raid Workflow

1. **Create** a raid in Admin → Raids tab (title, dates, base EXP)
2. **Wait** for guilds to submit entries during the active period
3. **Close Submissions** when ready (or let end_date pass)
4. **Score** each submission (0-100) using the inline inputs
5. **Finalize & Release EXP** — confirms the podium and distributes tiered EXP to all guild members

### Quest Workflow

1. **Create** a quest with difficulty, EXP reward, and optional badge
2. Users submit GitHub URLs in the Tavern
3. **Review** submissions — Approve awards EXP + badge, Reject with notes

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a PR.

## 📄 License

This project is licensed under the MIT License.
