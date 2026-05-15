# oda - Premium B2B Marketplace MVP

oda is a modern, production-ready B2B marketplace platform designed with a clean earth-tone aesthetic. It connects buyers with verified sellers in a trust-driven ecosystem.

## Tech Stack
- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Charts:** Recharts

## Earth Tone Palette
- **Olive Green:** #556B2F (Primary)
- **Sand:** #D8C3A5 (Secondary)
- **Terracotta:** #C96A4A (Accent)
- **Warm Beige:** #F5F0E6 (Background)
- **Dark Brown:** #3E2C23 (Text/UI)

## Getting Started

### 1. Supabase Setup
To get the backend fully functional, you need to create a project on [Supabase](https://supabase.com).

1.  Create a new project.
2.  Go to the **SQL Editor** and run the contents of `/supabase_schema.sql` located in this project.
3.  Go to **Project Settings > API** and copy your `Project URL` and `anon public key`.

### 2. Environment Variables
Update the `.env` file (or set secrets in AI Studio) with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Running the App
- The app uses Vite for blazing-fast development.
- The entry point is `src/main.tsx`.
- Routing is handled via `react-router-dom`.

## Project Structure
- `/src/lib/supabase.ts`: Core client initialization and types.
- `/src/contexts/AuthContext.tsx`: Authentication state management.
- `/src/components/layout/`: Shared UI structures (Dashboard, Auth, etc.).
- `/src/pages/`: Feature-specific pages:
  - `LandingPage.tsx`: Marketing site.
  - `MarketplacePage.tsx`: Product browsing and search.
  - `SellerDashboard.tsx`: Inventory and inquiry management.
  - `BuyerDashboard.tsx`: Sourcing activity and tracking.
  - `AdminDashboard.tsx`: User and platform moderation.

## Features
- **Role-Based Access Control:** Distinct workflows for Buyers, Sellers, and Admins.
- **Verification System:** Seller profiles are vetted before being displayed.
- **Inquiry Engine:** Integrated communication for quoting and sourcing.
- **Real-time Analytics:** Visual data representation for business engagement.
