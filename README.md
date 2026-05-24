# 🐉 Dragon Drop

**Dragon Drop** is a cross-platform desktop game designed to help students near the border regions of Cambodia learn how to use a computer mouse effectively — through fun, drag-and-drop puzzle gameplay.

> 🌏 **Empowering offline learning through fun and play.**

---

## 🎮 Gameplay

Guide your dragon to the steak 🥩 by **clicking and dragging** it across the board. Avoid walls, hazards, enemies, and traps — all while racing against the clock!

- **60 handcrafted levels** across multiple worlds
- **Collectibles:** Coins 🪙, Gems 💎, Hearts ❤️, and Power-Ups
- **Power-Ups:** Shield 🛡️, Slow-Mo ⏱️, Time Freeze ❄️
- **Enemies:** Patrol bots, chase bugs, moving walls
- **Special mechanics:** Gates, buttons, portals, crumbling floors, moving goals
- **Drag to move** on both desktop (mouse) and mobile/tablet (touch)
- **Keyboard controls** supported (Arrow keys / WASD)
- **Dragon skins:** Default, Golden, Ruby, Amethyst, Shadow
- **Achievements, Leaderboards, Daily Challenges**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔌 **Fully Offline** | Runs entirely without internet — no server needed |
| 🖥️ **Cross-Platform** | Linux `.AppImage` & Windows `.exe` |
| 📱 **Responsive** | Works on desktop, tablet, and mobile screens |
| 🎵 **Audio** | Theme music + SFX per level theme |
| 🌙 **Dark Mode UI** | Premium glassmorphism design |
| 🏆 **Progress Saving** | Game state persisted via `localStorage` |
| 🌏 **Khmer Localization** | UI elements in Khmer for local students |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Desktop Shell | Electron 40 |
| Packaging | electron-builder 26 |
| Graphics | HTML5 Canvas (2D) |
| Audio | Web Audio API |
| Styling | Vanilla CSS (glassmorphism, animations) |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (bundled with Node.js)
- Git

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sivchhengkheang/dragon-drop.git
cd dragon-drop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development (browser)

```bash
npm run dev
```
Opens at `http://localhost:3000` — live reload enabled.

### 4. Run as Electron desktop app (development)

```bash
npm run electron:dev
```
Launches the game as a native desktop window with hot-reload and DevTools.

---

## 📦 Building for Production

All build outputs go to the **`release/`** directory.

### 🐧 Linux — AppImage (Arch Linux, Ubuntu, Debian…)

```bash
npm run build:linux
```

Output: `release/Dragon Drop-1.0.0.AppImage`

**To run the AppImage:**
```bash
chmod +x release/Dragon\ Drop-*.AppImage
./release/Dragon\ Drop-*.AppImage
```
Or right-click → Properties → Permissions → Allow executing as program, then double-click.

---

### 🪟 Windows — NSIS Installer (.exe)

```bash
npm run build:win
```

Output: `release/Dragon Drop Setup 1.0.0.exe`

> **Note:** Building the Windows `.exe` on Linux requires `wine` with a configured prefix (`~/.wine`).  
> On Windows, the build runs natively without any extra setup.

**To install on Windows:**
1. Transfer `Dragon Drop Setup 1.0.0.exe` to the target Windows machine
2. Double-click to run the installer
3. Follow the setup wizard — the game will be added to the Desktop and Start Menu

---

### 🌍 Both Platforms (one command)

```bash
npm run build:all
```

Builds both the Linux `.AppImage` and Windows `.exe` in a single step.

---

## 📁 Project Structure

```
dragon-drop/
├── electron/           # Electron main process (main.cjs, preload.cjs)
├── public/             # Static assets (icons, fonts)
├── src/
│   ├── assets/         # Images, audio, styles
│   ├── components/     # Reusable React components (GameBoard, HUD…)
│   ├── game/           # Core game logic
│   │   ├── GameEngine.ts       # Canvas rendering + drag/drop input
│   │   ├── levels.ts           # All 60 level definitions
│   │   ├── AudioManager.ts     # Music + SFX system
│   │   ├── AchievementManager.ts
│   │   ├── SkinManager.ts
│   │   └── ...
│   └── ui/             # Full-screen UI screens (Menu, LevelSelect…)
├── release/            # Build output (AppImage, exe) — git-ignored
├── dist/               # Vite web bundle — git-ignored
├── dist-electron/      # Compiled Electron main process
└── package.json        # Scripts + electron-builder config
```

---

## 🎯 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (browser) |
| `npm run electron:dev` | Start Electron app in dev mode |
| `npm run build` | Build web bundle only |
| `npm run build:linux` | Build Linux `.AppImage` |
| `npm run build:win` | Build Windows `.exe` installer |
| `npm run build:all` | Build both Linux + Windows |
| `npm run electron:build` | Build using default platform |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © 2026 [sivchhengkheang](https://github.com/sivchhengkheang)
