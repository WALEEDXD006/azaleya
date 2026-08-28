# Azaleya — Quiet Luxury in Earthy Tones

A modern e-commerce store built with React, Vite, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Setup

1. **Clone & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:5173`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Deployment

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --prod --dir=dist
```

### Manual
1. Run `npm run build`
2. Upload the `dist/` folder to any static host (Cloudflare Pages, S3, etc.)

> **Note:** Set your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your hosting platform's dashboard.

## Project Structure

```
azaleya/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components (Navbar, Footer)
│   ├── context/     # React contexts (Auth, Cart, Router)
│   ├── lib/         # Supabase client, utilities
│   ├── pages/       # Page components
│   └── main.tsx     # Entry point
├── supabase/        # Supabase migrations & config
└── dist/            # Production build output
```
