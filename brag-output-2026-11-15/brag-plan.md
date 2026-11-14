# Brag Plan: ATLAS — Cinematic Product Reveal

## What is this app?
ATLAS is a personal geographical experience journal built on Next.js 16, Three.js, Supabase, and Google Gemini AI. Users map their life onto an interactive 3D Earth — recording memories with photos, GPS coordinates, and ratings, while an AI companion named Orion recommends new adventures.

## Previous Video Analysis

The previous video (18s, `brag-output/brag.mp4`) used a `polished` tone with generic Bento-Pop motion graphics. Its weaknesses:

- **No real product UI** — all scenes were abstract CSS card animations, not actual application screenshots or states
- **Dead stretches** — Scenes 2 and 3 had 3.75s+ of minimal motion causing `dead_stretch` warnings
- **Wrong tone** — Used `polished` instead of `cinematic`; lacked dramatic reveals, epic scale, and trailer energy
- **Small unreadable text** — EXIF coordinate badges and sub-labels fell below 28px (`text_below_floor`)
- **Generic card layouts** — Bento-Pop styled cards rather than the actual ATLAS UI with its distinctive warm cream backgrounds, bold ink outlines, and pop shadows
- **No 3D globe representation** — The hero feature (interactive Three.js Earth) was represented as a flat CSS circle, not as the cinematic centrepiece it should be
- **Weak soundtrack alignment** — Used vol-1 track with minimal SFX punctuation
- **Flat transitions** — Simple slide/fade instead of cinematic dramatic wipes and scale reveals

## The New Angle

**"Your life is more than coordinates. It's every sunset, every summit, every story — mapped onto Earth."**

This time: cinematic trailer energy. Every scene earns its runtime. The 3D globe dominates. The ATLAS Bento-Pop UI is faithfully recreated. Typography hits like a film title card.

## Hook (first 3 seconds)
Darkness. A single point of light blooms into a stylized Earth. Bold ALL CAPS text slams: **"YOUR LIFE. MAPPED."** with a deep impact SFX.

## Key moments (the middle)
- **Beat 1: THE REVEAL** (3-6s) — Earth rotates into full view. The ATLAS brand identity appears with its purple compass, yellow star, and ink outlines. "MEET ATLAS." slams in.
- **Beat 2: EXPLORE** (6-11s) — Zoom into the globe. Location pins drop with tactile bounce — Tomato Red memories and Sunflower Yellow wishlists. The search bar appears. A location name resolves. The actual globe UI with its legend bar is visible.
- **Beat 3: REMEMBER** (11-16s) — A faithful recreation of the experience logging UI. Polaroid-style photo card with star rating, category badge, and location details. "EVERY PLACE HAS A STORY." in big cinematic type.
- **Beat 4: DISCOVER** (16-21s) — The Orion AI Companion chat interface: purple bot avatar, cream chat bubbles, yellow "Send" button. A recommendation card appears with "Save to Wishlist" action. "YOUR NEXT ADVENTURE IS OUT THERE."
- **Beat 5: GRAND FINALE** (21-25s) — Camera pulls back. Multiple pins glow on Earth. The ATLAS logo stamps centre-screen. "EXPLORE. REMEMBER. DISCOVER." then "YOUR LIFE, MAPPED." Final bell impact.

## Outro / punchline
**ATLAS** — bold, full-screen, with the distinctive purple compass icon and ink border. Tagline: **"YOUR LIFE, MAPPED."** Music swell. Silence.

## User flow worth showing
1. 3D Earth rotating with gamified texture (pop art continents)
2. Location pins — dual colour system (Tomato Red = memories, Sunflower Yellow = wishlist)
3. Globe click → location popover with "Record" and "Wishlist" buttons
4. Experience modal with photo, star rating, category
5. Orion AI chat with conversational recommendations
6. Save to Wishlist with pin appearing on globe

## Tone
- Preset: `cinematic`
- Creative direction: "Dramatic cinematic product reveal — a premium tech launch trailer"
- Interpretation: Epic. Short declarative sentences. Each one lands before the next begins. ALL CAPS or heavy mixed case. Dramatic reveals, not quick cuts. The product is treated like a blockbuster.

## Format: landscape — 1920×1080
## Duration: 25 seconds (5 scenes × 4-5 seconds each)

## Visual identity (from the project)
- Background: `#FFF4D9` (Warm butter cream) — the actual app background
- Primary: `#6425F5` (Electric Purple) — brand, Orion AI, compass
- Accent Red: `#F04432` (Tomato Red) — memories, experience pins
- Accent Gold: `#FFD45A` (Sunflower Yellow) — wishlists, dream pins, highlights
- Accent Blue: `#326BEE` (Cobalt Blue) — secondary interactive
- Border/Ink: `#171313` (Bold ink outline with hard drop shadow `3px 3px 0 #171313`)
- Display font: Plus Jakarta Sans (Black weight, ALL CAPS for headlines)
- Body font: Inter (Bold, sentence case for descriptions)
- Key UI details: `border-2 border-[#171313]`, `rounded-3xl`, `shadow-pop` (3px 3px 0px #171313)

## Share copy (draft)
ATLAS.
Your life, mapped.

## Audio direction
- Role: Cinematic support. Music builds tension, punctuates reveals, resolves on final logo.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (117s, steady and clean — best for cinematic)
- Music treatment: Fade-in over 0.5s on Scene 1. Full energy through Scenes 2-4. Music swell at 20s (finale). Clean fade-out over 1.5s ending at 25s.
- SFX posture: Cinematic — 3-4 big impact sounds on major reveals. Minimal subtle UI clicks.
- SFX choices:
  - `impact/impactSoft_heavy_003.ogg` (0.54s, warm) — Scene 1 hook text slam & Scene 5 finale logo
  - `impact/impactSoft_medium_001.ogg` (0.18s, warm, low HF) — Scene 2 brand reveal
  - `impact/impactBell_heavy_000.ogg` (medium HF) — Scene 5 final bell payoff
  - `interface/click_003.ogg` (0.01s, low HF) — Scene 3 pin drops (2×)
- Restraint rule: No more than 4 SFX total. Each on a major visual beat. No repeated ticks.

---

## Storyboard

### Scene 1 — THE HOOK — 3.0s (0.0–3.0)
- **Visual**: Black screen. A point of warm golden light blooms at centre, forming a stylized mini Earth silhouette. Bold ALL CAPS text fades up and slams into position: **"YOUR LIFE. MAPPED."** in Plus Jakarta Sans Black, 72px, cream (#FFF4D9) on black. Subtle warm cream particles drift.
- **Motion**: Light bloom scale 0→1.2→1.0 (0.3s ease). Text entrance: translateY(40px)→0 + opacity 0→1 over 0.5s with slight stagger per word.
- **Audio**: `impactSoft_heavy_003.ogg` at 0.8s (text slam). Music fade-in begins at 0.0s.
- **Transition**: Fast crossfade (0.3s) into Scene 2.

### Scene 2 — THE REVEAL — 3.0s (3.0–6.0)
- **Visual**: Warm cream (#FFF4D9) background with the subtle graph-paper grid pattern. The stylized 3D Earth representation (emerald land, cyan ocean, cartoon clouds) sits centre-left. Right side: The ATLAS brand lockup — purple compass icon in a circle with ink border, "ATLAS" in black serif ALL CAPS, star badge in yellow. Below: **"MEET ATLAS."** in 56px ALL CAPS black text with pop shadow.
- **Motion**: Earth enters from left at scale 0.7→1.0. Brand lockup slides in from right. Text entrance with typewriter-reveal feel.
- **Audio**: `impactSoft_medium_001.ogg` at 3.5s (brand entrance). Music is at full energy.
- **Transition**: Scale zoom (0.95→1.0) into Scene 3.

### Scene 3 — EXPLORE — 5.0s (6.0–11.0)
- **Visual**: Full-width globe view recreation. The gamified Earth centred with warm cream background. Tomato Red pin drops at "Paris" and "Tokyo" positions with bounce animation. Sunflower Yellow pin drops at "Iceland" with pulse. Bottom-left: the actual legend bar (●Memories ●Wishlist). Top: stylized search bar showing "Niagara Falls" resolving. Right side: location popover card with purple MapPin icon, location name, coordinates, "Record" (red) and "Wishlist" (yellow) buttons with ink borders.
- **Motion**: Globe slow-rotates. Pin 1 drops at 6.8s (bounce), Pin 2 at 7.6s, Pin 3 (yellow) at 8.4s. Search bar types at 9.0s. Location card slides in at 9.5s.
- **Audio**: `click_003.ogg` at 6.8s and 7.6s (pin drops). Music continues.
- **Transition**: Dramatic wipe-left into Scene 4.

### Scene 4 — REMEMBER — 5.0s (11.0–16.0)
- **Visual**: Split composition. Left: A polaroid-style memory card — photo thumbnail (mountain landscape placeholder) in rounded frame with ink border, star rating (★★★★★ in Tomato Red), "Adventure" category badge in yellow, title "Summit at Dawn", location "Chamonix, France", date stamp. Right: Large cinematic text: **"EVERY PLACE HAS A STORY."** in staggered lines, ALL CAPS, 48px, with purple accent underline doodle.
- **Motion**: Memory card enters with polaroid-tilt rotation (-1.5deg settling to 0deg). Stars fill in sequentially. Text lines stagger in from right (0.3s delay each).
- **Audio**: Music continues building. No additional SFX (restraint).
- **Transition**: Crossfade (0.5s) into Scene 5.

### Scene 5 — DISCOVER + FINALE — 4.0s (16.0–20.0)
- **Visual**: The Orion AI chat interface recreation: purple rounded-square bot avatar, cream chat bubble with bot message "Based on your love of mountain adventures, explore the Swiss Alps next!", user reply bubble in Tomato Red. Below: recommendation card with photo, "Swiss Alps" title, "Save to Wishlist" yellow button. Side text: **"YOUR NEXT ADVENTURE IS OUT THERE."**
- **Motion**: Chat messages type in sequentially (orion bubble 0.6s, user bubble 0.3s). Rec card slides up from bottom. Text enters from right.
- **Audio**: Music continues.

### Scene 6 — GRAND FINALE — 5.0s (20.0–25.0)
- **Visual**: The globe returns at full scale, now populated with 5-6 glowing pins (mix of red and yellow). Camera slowly pulls back. At 21.5s, everything dims slightly and the ATLAS logo badge stamps centre-screen — purple compass in white circle with ink border, "ATLAS" in huge 96px ALL CAPS below. At 23s: **"EXPLORE. REMEMBER. DISCOVER."** in spaced 36px text. At 24s: **"YOUR LIFE, MAPPED."** in smaller 28px text below. Hold.
- **Motion**: Globe rotation continues. Logo entrance: scale 0→1.2→1.0 with subtle bounce. Taglines fade in with stagger.
- **Audio**: `impactSoft_heavy_003.ogg` at 21.5s (logo slam). `impactBell_heavy_000.ogg` at 23.0s (bell payoff). Music fade-out begins at 23.5s, ends at 25.0s.
- **Transition**: Hold on final frame. Cut to black at 25.0s.

**Music mood for this video:** Cinematic, building energy, confident. Clean electronic with steady pulse.
**Audio summary:** Deep impact on hook, crisp accent on brand reveal, subtle clicks on pins, dramatic bell on finale. Music carries the emotional arc.

