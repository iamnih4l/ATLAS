# 🌍 ATLAS — The Digital Cartography of Your Life

```
    ___  _____ _      ___  ____  
   / _ \/__   \ |    / _ \/ ___| 
  / /_\ \ / /\/ |   / /_\ \___ \ 
 / /   \// /  | |__/ /   \ \__) |
 \/    \/\_/   |_____\/   \_____/ 
 A Living, Gamified 3D Cartography of Your Life
```

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Three.js-WebGL%203D-orange?style=for-the-badge&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Supabase-PostGIS_%2B_RLS-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Design-Bento--Pop-FFF4D9?style=for-the-badge" alt="Bento-Pop Style" />
</p>

> *"Every mountain you conquer, every alleyway café in Kyoto, and every midnight train across Europe isn't just a fleeting social media post. It is a coordinate on the spinning Earth. It is a chapter in the atlas of your life."*

---

## 🧭 Interactive Compass — Choose Your Path

<details open>
<summary><b>📖 Prologue: The Story Behind ATLAS (Click to collapse/expand)</b></summary>
<br />

Remember spinning an old physical globe in a sunlit classroom as a kid? Placing your finger on an archipelago across the ocean and whispering, *"One day, I will stand there."*

In modern life, our memories are scattered: lost inside algorithms that optimize for likes, buried under thousands of unorganized camera roll snapshots, or forgotten in text threads. 

**ATLAS brings back the romanticism of the personal journal.** It combines the archival prestige of Letterboxd with a tactile, gamified 3D Earth. Every milestone you record is pinned to real WGS84 geographic coordinates, preserved with half-star precision, and protected by end-to-end database security.

And when you wonder where to go next? **Orion**, your AI celestial expedition navigator, reads the patterns in your past adventures and charts your next horizon.

</details>

<details>
<summary><b>🕹️ The Explorer's Guide (How the app works)</b></summary>
<br />

- **Spin & Zoom the 3D Earth**: WebGL rendered at 60 FPS with tactile inertia damping.
- **Drop Pins with 1 Click**: Click anywhere on continents or oceans — Nominatim reverse-geocodes the exact city and country in real time.
- **Auto-Extract GPS from Photos**: Drop a camera photo and let `exifr` detect the exact latitude, longitude, camera model, and capture date.
- **Consult Orion (AI Travel Companion)**: Chat in real time with an AI that knows your travel history and gives grounded recommendations.
- **One-Click Wishlist Conversion**: Turn dream destinations into completed memories when you return from your journey.

</details>

<details>
<summary><b>⚡ The Engineer's Blueprint (Architecture & Stack)</b></summary>
<br />

- **Frontend**: Next.js 16 (App Router, Turbopack, React 19), Tailwind CSS v4, Framer Motion, Lucide Icons.
- **3D Engine**: Three.js WebGL canvas with custom gamified shaders, atmospheric Rayleigh glow, and Cartesian WGS84 spherical coordinate projections.
- **State Management**: Zustand 5 with local offline persistence and optimistic UI updates.
- **Artificial Intelligence**: Google Gemini API (`gemini-3.5-flash-lite`) powering conversational travel advice and structured JSON coordinate suggestions.
- **Cloud Database**: Supabase PostgreSQL 15 + PostGIS spatial geography indexing + Row Level Security (RLS) policies enforcing `auth.uid() = user_id`.

</details>

---

## 🗺️ System Architecture

```mermaid
flowchart TD
    User([Explorer / Traveler]) -->|Touch / Mouse Orbit| Globe[3D Three.js WebGL Earth]
    User -->|Upload Photos| EXIF[exifr EXIF GPS Engine]
    User -->|Ask Advice| Orion[Orion AI Assistant]

    subgraph Client Application ("ATLAS Bento-Pop Engine")
        Globe -->|Click Coordinate| Geocoder[Nominatim Reverse Geocoding]
        EXIF -->|Auto-Pin Location| MemStore[Zustand 5 Experience Store]
        Orion -->|Fly Camera to Target| Globe
    end

    subgraph Intelligence & Services
        Orion <-->|Live Travel Insights| Gemini["Google Gemini 3.5 API"]
        Geocoder <-->|OpenStreetMap Coordinates| OSM[Nominatim Server]
    end

    subgraph Cloud Fortress ("Supabase Cloud")
        MemStore <-->|Row Level Security| DB[(PostgreSQL + PostGIS)]
        DB --> Locations[locations Table & Geo Index]
        DB --> Experiences[experiences Table]
        DB --> Wishlist[wishlist_items Table]
    end
```

---

## 🌟 The Five Chronicles of ATLAS

### 🌍 Chapter I: The Living Globe (`/globe`)
- **60 FPS Tactile Orbit**: Built on custom Three.js shaders with atmospheric Rayleigh scattering, warm Bento-Pop landmasses, and zero clutter.
- **Dual-Marker Cartography**:
  - 🟢 **Emerald Pins (`#10b981`)**: Visited milestones, stamped into reality.
  - 🟣 **Violet Pulsing Markers (`#8b5cf6`)**: Whispers of the future — your active travel bucket list.
- **Spatial Multi-Tenancy**: Visit Niagara Falls for a freezing boat tour in 2021, and return for a helicopter flight in 2025. Both memories comfortably share the exact physical coordinate without overwriting history.
- **Fly-to-Target Navigation**: Click any city, pin, or recommendation card to swoosh the 3D camera across oceans at cinematic speed.

---

### 📸 Chapter II: The Chronicler's Quill (`/memories` & EXIF Magic)
- **Instant Photo Geocoding**: Drop a vacation photo from your smartphone. `exifr` extracts embedded GPS coordinates, camera hardware, and timestamps, prompting you:
  > *"📍 GPS detected in photo! Found: Eiffel Tower, Paris (48.8584° N, 2.2945° E). Confirm and apply location?"*
- **Letterboxd-Style Half-Star Precision**: Rate memories from `⭐ 0.5` to `⭐⭐⭐⭐⭐ 5.0` with custom half-star hovering.
- **15 Curated Travel Categories**: *Adventure, Nature, Food & Dining, Travel, Sports, Entertainment, Culture, Architecture, Wildlife, Photography, Spiritual, Family, Hidden Gem, Transit, Other.*
- **Vault Privacy**: Control visibility per experience — `Private` (only you), `Unlisted` (shareable link), or `Public`.

---

### 🌌 Chapter III: Orion — The AI Celestial Companion (`/discover`)
Orion is not a sterile chatbot. Powered by **Google Gemini**, Orion acts as your charismatic expedition navigator:

```text
Explorer: "I loved skydiving in Dubai, what's my next thrill?"
Orion: "Since you rated tandem freefall 5.0, your next horizon is Interlaken, 
        Switzerland! Glide from the alpine meadows of Beatenberg at 1,350m over 
        turquoise Lake Thun with the towering Eiger directly ahead."
```

- **Next Horizon Mode**: Identifies natural progressions in your adventurous tastes.
- **Proximity Radar Mode**: Locates hidden spots within striking distance of your current location.
- **Bucket List Architect**: Crafts rich itineraries from vague travel daydreams.
- **Grounded Coordinates**: Every recommendation comes with real latitude, longitude, and a one-click **"Fly on Globe"** or **"Save to Wishlist"** action.

---

### ⏳ Chapter IV: The Traveler's Ledger (`/timeline` & `/statistics`)
- **The Winding Road Timeline**: Visual chronological milestone badges mapping your life by year and season.
- **Raw True Analytics**: No vanity metrics. Real computing over your PostgreSQL ledger:
  - Total countries stamped & cities claimed.
  - Interactive Recharts breakdown: rating distribution, top visited countries, and category donuts.
  - Bucket list completion ratio (Dreamt vs. Conquered).

---

### 🛡️ Chapter V: The Cloud Fortress (Supabase & PostGIS)
- **Zero-Trust Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer via `auth.uid() = user_id`.
- **Public Isolation**: System tables like `spatial_ref_sys` have all public API grants revoked — external visitors cannot query or tamper with internal projection tables.
- **Dual-Env Hybrid Authentication**: Seamlessly supports both `NEXT_PUBLIC_` client tokens and backend `@supabase/server` publishable/secret keys.
- **Guest Explorer Mode**: Instant exploration without mandatory sign-in, while preserving a frictionless upgrade path to permanent cloud sync.

---

## 🏆 Traveler's Achievement Roster

Can you unlock all badges on your ATLAS passport?

| Badge | Title | Requirement |
|:---:|---|---|
| 🎒 | **The First Step** | Record your very first travel memory |
| 🦅 | **High-Altitude Dreamer** | Log an Adventure category experience rated 5.0 |
| 🧭 | **Continent Hopper** | Place pins across 3 or more distinct continents |
| 📸 | **Digital Archaeologist** | Auto-detect coordinates using photo EXIF GPS |
| 🌌 | **Orion's Protégé** | Ask Orion for advice and save a recommendation to your Wishlist |
| 🎯 | **Dream Realized** | Convert a bucket list item into a completed memory with "Done! Record It" |
| 👑 | **Grand Cartographer** | Map 25 or more verified coordinates on the 3D globe |

---

## 🚀 Quickstart — Run ATLAS in 60 Seconds

### 1. Clone the Vessel
```bash
git clone https://github.com/iamnih4l/ATLAS.git
cd ATLAS/atlas-app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Your Environment
Create `atlas-app/.env.local`:
```ini
# Supabase Cloud Database (Required for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key

# Google Gemini AI (Powers Orion Travel Companion)
AI_PROVIDER=google
AI_MODEL=gemini-3.5-flash-lite
AI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
```

*(Note: ATLAS runs out-of-the-box in local guest mode even before connecting cloud keys!)*

### 4. Initialize Database
Execute the migrations in your Supabase SQL Editor:
1. `atlas-app/supabase/migrations/00001_initial_schema.sql` (Creates all 11 tables, categories & PostGIS indexes)
2. `atlas-app/supabase/migrations/00002_secure_spatial_ref_sys.sql` (Secures PostGIS system tables)

### 5. Launch the Expedition
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser, pick a spot on Earth, and begin mapping your story!

---

## 🧪 Verification Matrix

Every release is validated against 14 automated & manual test scenarios:

```
[✓] TEST 01: User registration, authentication & guest bypass
[✓] TEST 02: Real-time geocoding search via Nominatim
[✓] TEST 03: Experience creation with multi-photo uploads & ratings
[✓] TEST 04: Three.js Cartesian coordinate spherical marker projection
[✓] TEST 05: Fly-to-coordinate camera interpolation & detail drawer
[✓] TEST 06: Spatial multi-tenancy (multiple memories per location)
[✓] TEST 07: Client-side EXIF GPS parsing via exifr
[✓] TEST 08: Google Drive cloud photo import flow
[✓] TEST 09: Google Gemini Orion conversational AI integration
[✓] TEST 10: AI recommendation to wishlist conversion
[✓] TEST 11: Distinct violet globe styling for wishlist items
[✓] TEST 12: "Done! Record It" bucket list resolution
[✓] TEST 13: Dynamic analytics & Recharts aggregations
[✓] TEST 14: Row Level Security user data isolation
```

---

## 📜 Epilogue

> *"Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover."*  
> — **Mark Twain**

**Built with passion by Nihal & the ATLAS team.**  
*Contributions, issue reports, and travel stories are always welcome.*
