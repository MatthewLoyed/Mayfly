# Serene Botanical Design System

## Core Philosophy
"Organic Minimalism" - The interface should feel like a living ecosystem.
- **shapes**: Pebble-like, organic, rounded, soft.
- **motion**: Fluid, water-like, growing, hovering.
- **feedback**: Tactile but soft (haptics + scaling).

## Color Palette

### Base
- **Deep Forest Charcoal**: `#1A1C1A` (Primary Background - Matches Garden Overlay vibe)
- **Subtle Organic Surface**: `#252825` (Card Background)

### Accents (Garden Derived)
- **Sage Growth**: `#9CAF88` (Completion / Success - Main Garden Green)
- **Lavender Mist**: `#B5A8D6` (Secondary / UI Elements)
- **Sunset Gold**: `#E6B874` (Streaks / Highlights / Sun)
- **River Stone**: `#3A3D3A` (Inactive Elements)

### Text
- **Morning Mist**: `#E8E8E8` (Primary Text)
- **Stone Grey**: `#A0A0A0` (Secondary Text)

## Typography

### Headers (Nature Journal)
- **Font**: Serif (System Serif or specialized if added later)
- **Style**: Elegant, readable.

### Numbers & Data
- **Font**: Rounded Sans-Serif (`ui-rounded` on iOS)
- **Style**: Friendly, clean.

## UI Components

### Pebble Card
- **Shape**: Asymmetric rounded corners (e.g., `borderRadius: 24`, varying to look like stones).
- **Shadow**: Soft, diffused shadows (`shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10`).
- **Texture**: Smooth matte finish.

### Growth Forest Chart
- **Bars**: Stylized sprouts/trees.
- **Animation**: Grow upwards on load.

### Living Progress Bar
- **Concept**: Vine growing or water filling.
- **Visual**: Organic path, not just a straight line.

### Butterfly Hero
- **Interaction**: Hovers, reacts to touch/completion.
- **State**: Glows when 100% goals met.

## Animations
- **Transitions**: `LinearTransition` for layout changes.
- **Interactions**: Scale `0.98` on press.
- **Ambient**: Subtle breathing/hovering for the specific elements (Butterfly).
