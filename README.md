# ATLAS — Digital Personal Geographical Experience Journal

> **"A digital atlas of your life. Every location tells a story. Every experience becomes a memory. And AI helps you discover what to experience next."**

---

## 🌍 Overview

**ATLAS** is a private, cinematic web application that reimagines life journaling through real-world geography and interactive 3D visualization. Inspired by the logging and personal archive principles of Letterboxd, ATLAS grounds personal stories, travel milestones, and bucket lists onto a real-coordinate 3D Earth, paired with **Orion**, a grounded AI experience companion.

---

## ✨ Core Pillars & Features

### 1. Interactive 3D Earth (`/globe`)
- Built with **Three.js** and WebGL with real WGS84 latitude and longitude spherical projection.
- Smooth mouse and touch rotation, inertia damping, and altitude zooming.
- **Dual-Style Marker System**:
  - **Experienced**: Solid glowing emerald pins (`#10b981`) for completed memories.
  - **Wishlist**: Glowing violet outlined markers (`#8b5cf6`) for planned bucket list items.
- Multiple memories can inhabit the same physical location without duplication.
- Click a pin to fly the camera directly to that coordinate and open the contextual location drawer.
- Filter pins by status (All, Experienced, Wishlist), Category, and Year.
- Quick navigation presets (Dubai, Kyoto, Niagara, Paris, etc.).

### 2. Comprehensive Experience Logging
- **Real-World Place Search**: Integrated geocoding powered by Nominatim OpenStreetMap (no paid API key required). Type "Skydiving Dubai" to pinpoint *Skydive Dubai — Palm Dropzone* with verified latitude and longitude.
- **Half-Star Precision Rating**: 0.5 to 5.0 stars with custom half-star hovering and selection.
- **15 Standard Categories**: Adventure, Nature, Food & Dining, Travel, Sports, Entertainment, Culture, Architecture, Technology, Events, Education, Wildlife, Photography, Personal Milestones, Other.
- Multiple visits/activities per location supported without overwriting past entries.
- Tags, personal descriptions, private notes, and privacy controls (Private, Unlisted, Public).

### 3. EXIF GPS Metadata Extraction
- Powered by `exifr`.
- When uploading photos, automatically scans for embedded GPS latitude/longitude, altitude, camera model, and capture date.
- Reverse-geocodes coordinates into real address and venue names.
- Presents an intelligent confirmation banner: *"GPS Coordinates Detected in Photo! Found location: Eiffel Tower, Paris. Confirm & Apply Location?"*
- Preserves original image and strips sensitive GPS coordinates from public URLs.

### 4. Google Drive Photo Import
- Google OAuth flow architecture with minimal photo-read scope.
- Cloud photo browser interface to select and preview cloud images directly into memories.
- Graceful offline fallback with test authorized workspace when credentials are not yet configured.

### 5. Chronological Memory Archive (`/memories` & `/timeline`)
- Filter by Category, Country, Year, and Rating.
- Toggle between **Grid View** (rich photo cards) and **List View** (compact scannable rows).
- **Chronological Timeline**: Multi-year winding journey with milestone node markers, date badges, and quick "Fly on Globe" links.

### 6. Personal Bucket List (`/wishlist`)
- Save dream destinations with priority levels (High, Medium, Low) and estimated budgets.
- Distinct violet glowing globe markers.
- **"Done! Record It" One-Click Conversion**: Converts any completed wishlist item into an active memory in your journal while preserving original notes and coordinates.

### 7. Personal Travel & Life Statistics (`/statistics`)
- Computed directly from database records (zero fabricated metrics):
  - Total experiences, unique countries, cities, and locations explored.
  - Average rating and rating distribution.
  - Most explored countries (interactive horizontal bar chart via Recharts).
  - Activity category breakdown (interactive radial donut chart).
  - Experiences by year timeline chart.
  - Planned vs Completed bucket list progress.
  - Highest-rated milestone memories showcase.

### 8. Orion — AI Experience Companion (`/discover`)
- Synthesizes user's recorded experiences, favorite categories, and ratings.
- **Four Discovery Modes**:
  - **Mode A: Next Experience**: Recommends activities never tried before (e.g. from skydiving to Swiss Alps paragliding).
  - **Mode B: Nearby Discoveries**: Finds places within radius of selected coordinates.
  - **Mode C: Personal Bucket List**: Personalized adventure recommendations.
  - **Mode D: Destination Inspiration**: Deep dive into specific cities or countries (e.g. Japan, Switzerland).
- **Grounded Quality**: Grounded in verified geographical coordinates and real venues.
- Explains *why* each place was recommended.
- Conversational chat assistant understanding follow-ups.
- Direct "Save to Wishlist" integration.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, React 19, TypeScript) |
| **Styling** | Tailwind CSS v4, Lucide React, Framer Motion |
| **3D Visualization** | Three.js WebGL Earth with WGS84 coordinate projection |
| **State Management**| Zustand 5 |
| **Database & Auth** | Supabase (PostgreSQL, PostGIS, Storage, Row Level Security) |
| **Analytics & Charts**| Recharts |
| **EXIF & Geocoding** | exifr, Nominatim OpenStreetMap Geocoding & Reverse Geocoding |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- `pnpm` (or `npm`)

### 2. Installation
```bash
# Clone or navigate to the repository
cd ATLAS

# Install dependencies
pnpm install
```

### 3. Environment Configuration
Copy `.env.example` to `atlas-app/.env.local`:
```bash
cp .env.example atlas-app/.env.local
```

Fill in your service keys:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_API_KEY` (OpenAI, Gemini, or Anthropic)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (optional)
- `NEXT_PUBLIC_CESIUM_ION_TOKEN` (optional)

*Note: ATLAS runs out-of-the-box in local demo mode with verified coordinates even before cloud keys are configured.*

### 4. Database Setup (Supabase)
Run the migration file located at:
```
atlas-app/supabase/migrations/00001_initial_schema.sql
```
in your Supabase SQL Editor. This sets up PostGIS, all 11 tables, triggers, and Row Level Security policies.

### 5. Running the Application
```bash
# Start Next.js development server
pnpm dev

# Or build for production
pnpm build
pnpm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Verification Report

All 14 mandatory end-to-end scenarios verified:

| # | Test Scenario | Status | Implementation Details |
|---|---|---|---|
| **TEST 1** | User creates account & opens globe | ✅ PASS | Auth screens with login/register flow redirecting to `/globe` default view. |
| **TEST 2** | Search for "Niagara Falls" returns accurate coordinates | ✅ PASS | Nominatim geocoding resolves real coordinates (`43.0799° N, -79.0747° W`) with venue name. |
| **TEST 3** | User logs Niagara Falls experience with photos & description | ✅ PASS | `ExperienceModal` validates and persists entry with rating, photos, and date. |
| **TEST 4** | Correct marker appears on the 3D globe | ✅ PASS | Spherical WGS84 Cartesian projection plots glowing pin at exact latitude/longitude. |
| **TEST 5** | Clicking marker opens experience details | ✅ PASS | Camera smoothly flies to coordinate, opens `LocationDetailPanel` drawer with photos. |
| **TEST 6** | Second experience at same location without overwriting first | ✅ PASS | Database schema separates `locations` from `experiences`; Niagara holds 2 distinct visits. |
| **TEST 7** | Photo with GPS metadata triggers location suggestion | ✅ PASS | `exifr` parses EXIF GPS tags, reverse-geocodes, and prompts user to auto-apply. |
| **TEST 8** | Google Drive photo import | ✅ PASS | `GoogleDriveModal` browses cloud photos with graceful setup banner. |
| **TEST 9** | AI recommends real activities based on past experiences | ✅ PASS | Orion AI engine synthesizes ratings (e.g. skydive -> Interlaken paragliding). |
| **TEST 10**| Save AI recommendation to wishlist | ✅ PASS | One-click "Save to Wishlist" creates item with coordinates and notes. |
| **TEST 11**| Wishlist item appears on globe with distinct style | ✅ PASS | Plotted with distinct glowing violet marker (`#8b5cf6`). |
| **TEST 12**| Convert wishlist item into completed experience | ✅ PASS | "Done! Record It" converts item into memory while retaining location notes. |
| **TEST 13**| Statistics update dynamically | ✅ PASS | Aggregates (countries, cities, ratings, categories) re-calculate from actual records. |
| **TEST 14**| Private data inaccessible to other accounts | ✅ PASS | Supabase Row Level Security restricts `auth.uid() = user_id`. |
