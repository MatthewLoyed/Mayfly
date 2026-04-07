<div align="center">

# Mayfly v1.0
### A High-Fidelity Ecosystem for Mindful Habit & Task Management
**Mississippi State University** | **CSE Capstone Project** | **Spring 2026**

---

[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

## 🌿 The Vision

**Mayfly** is a zen-inspired, premium productivity application that reimagines the relationship between discipline and delight. Moving beyond transactional checklists, Mayfly offers a "Serene Botanical" ecosystem where personal growth is visualized through the **Butterfly Garden**—a living metaphor for your daily habits.

Every interaction in Mayfly is designed to be **tactile, fluid, and intentional**, utilizing state-of-the-art animations and haptic feedback to turn routine into ritual.

---

## ✨ Core Pillars

### 🦋 The Butterfly Garden
Your habits aren't just rows in a database; they are life in your garden. 
- **Visual Growth**: Complete recurring habits to populate your garden with vibrant, high-fidelity butterflies.
- **Persistence Logic**: Built on a sophisticated SQLite foundation to ensure your progress is never lost.
- **Micro-Animations**: Every "completion" triggers a bespoke animation sequence that celebrates your win.

### 🧘 Tactile Productivity
- **My Tasks**: A distraction-free todo list with "Priority Focus" modes and inline management designed for velocity.
- **Expressive Character**: A reactive companion that monitors your productivity "ecosystem" and reflects your current state with shifting moods and interactive dialogue.
- **Haptic Ecosystem**: Multi-layered vibration feedback (`expo-haptics`) differentiates between simple taps, success events, and critical alerts.

### 📐 Serene botanical Design System
- **Colors**: A custom, harmonized palette based on Forest Charcoal, Sage Growth, Lavender Mist, and Sunset Gold.
- **Typography**: Uses modern, rounded system fonts for a friendly yet premium feel.
- **Interface**: Implements frosted-glass effects (`expo-blur`) and spring-based transitions for a native, high-end experience.



---

## 🛠️ Technical Architecture

Mayfly is engineered with a focus on **Platform Logic Parity**, ensuring a "Premium Default" experience across all devices.

- **Frontend**: [React Native](https://reactnative.dev/) with [Expo Router](https://docs.expo.dev/router/introduction/) for seamless, file-based navigation.
- **Animation Engine**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for 60fps gesture-based interactions.
- **Data Persistence**:
  - **Native**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for low-latency, relational local storage.
  - **Web**: A specialized in-memory SQLite shim with **LocalStorage backup**, ensuring high performance in the browser.
- **Icons & Symbols**: [Lucide React Native](https://lucide.dev/) and [Ionicons](https://ionic.io/ionicons) curated via a centralized safe-access layer.

### Directory Structure
```text
mayfly/
├── app/               # File-based navigation & screen layouts
├── components/        # Atomic UI components & reanimated views
├── services/          # Business logic & Database Abstraction Layer
├── constants/         # Theme tokens, Message Generators & Icons
└── assets/            # High-fidelity botanical assets & splash screens
```

---

## 🚀 Installation & Local Environment

### Prerequisites
- Node.js (v18+)
- Expo Go (Mobile App) or Xcode/Android Studio (Emulators)

### Setup
1. **Clone & Install**
   ```bash
   git clone https://github.com/MatthewLoyed/Mayfly.git
   cd Mayfly
   npm install
   ```

2. **Launch with Tunnel (Recommended)**
   ```bash
   npm run start:tunnel
   ```
   *The tunnel ensures connectivity between your development machine and your physical phone on most networks.*

3. **Platform Access**
   - Press **`i`** for iOS.
   - Press **`a`** for Android.
   - Press **`w`** for Web.

---

## 🎓 Academic Contribution

This project was developed by **Matthew Loyed** for the **CSE Senior Capstone** at **Mississippi State University**. Mayfly serves as an exploration of high-fidelity mobile UX/UI principles, cross-platform database abstraction, and expressive interaction design in productivity software.

**Author**: [Matthew Loyed](https://github.com/MatthewLoyed)
**Date**: April 2026
**Institution**: Mississippi State University | Bagley College of Engineering

---
<div align="center">
Built with ❤️ and Intent in Starkville, MS.
</div>
