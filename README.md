# Mayfly v1.0 🦋

Mayfly is a zen-inspired habit tracker and productivity app designed to make every day count. It combines task management with a "Butterfly Garden" where your habits bloom and a friendly character that reacts to your progress.

## ✨ Features

- **My Tasks**: A clean, prioritized todo list with inline deletion and auto-focus for quick entry.
- **Butterfly Garden**: Tracks your recurring habits. Complete them to populate your garden.
- **Character Moods**: An expressive character that monitors your interactions and habits to reflect your productivity.
- **Cross-Platform Symmetry**:
  - **Native**: Uses `expo-sqlite` for robust local storage.
  - **Web**: Uses a high-performance in-memory shim for a seamless browser experience.
- **Premium UI/UX**: Smooth transitions (v1.0), haptic feedback, and a custom animated splash screen.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the App**
   ```bash
   npx expo start
   ```

3. **Platforms**
   - Press **i** for iOS Simulator.
   - Press **a** for Android Emulator.
   - Press **w** for Web version.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) / React Native
- **Navigation**: Expo Router (File-based)
- **Database**: 
  - [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Native)
  - Custom In-memory SQLite Shim (Web)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Icons**: [Expo Symbols](https://docs.expo.dev/versions/latest/sdk/symbols/) (SF Symbols fallback)

## 📁 Project Structure

- `app/` - File-based routes and layouts.
- `components/` - Reusable UI components (todos, habits, character).
- `services/` - Core logic (database handlers, habit/todo services).
- `constants/` - Theme colors and app constants.

---
*Created with ❤️ by Matthew Loyed*
