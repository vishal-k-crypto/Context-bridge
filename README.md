<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00ffa3,50:00a8ff,100:7c3aed&height=200&section=header&text=Context%20Bridge&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Automation%20Systems%20That%20Run%20While%20You%20Sleep&descAlignY=55&descSize=18"/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

[🌐 Live Demo](https://contextbridge.systems) · [📖 Documentation](#-quick-start) · [🚀 Deploy](#-deployment)

</div>

---

## ✨ What is Context Bridge?

**Context Bridge** is a premium full-stack automation agency portfolio featuring an immersive 3D web experience and an AI-powered MCP (Model Context Protocol) server generator.

### 🎯 Two Worlds, One Repository

| Frontend | Backend |
|----------|---------|
| 🎨 Immersive 3D portfolio site | 🤖 Autonomous MCP server factory |
| 🌊 Fluid animations & WebGL effects | 🏗️ AI agents that write production code |
| ⚡ Next.js 14 + React + Three.js | 🐍 Python + FastMCP + LangGraph |
| 🎯 Smooth scroll with Lenis | 🐳 Docker sandbox verification |

---

## 🎬 Preview

<div align="center">

### Immersive Hero Experience
*Scroll-driven 3D scene with floating automation nodes*

### MCP Factory Demo
*Watch AI agents build production-ready MCP servers in real-time*

</div>

---

<a id="quick-start"></a>

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm/yarn/pnpm**
- **Python 3.12+** (for MCP features)
- **Docker Desktop** (for MCP sandbox verification)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/context-bridge.git
cd context-bridge

# Install frontend dependencies
npm install

# Install Python dependencies (for MCP features)
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - Supabase credentials (for MCP demo database)
# - Anthropic API key (for AI agent features)
```

### 3. Run Development Server

```bash
# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the magic ✨

---

<a id="architecture"></a>

## 🏗️ Architecture

### Frontend Stack

```
├── app/                    # Next.js 14 app router
│   ├── page.tsx           # Main landing page
│   ├── demo/mcp-builder/  # MCP factory demo
│   └── layout.tsx         # Root layout with fonts
├── components/
│   ├── canvas/            # Three.js 3D components
│   │   ├── AutomationNode.tsx
│   │   ├── ServerRack.tsx
│   │   ├── NeuralNetwork.tsx
│   │   └── DataFlow.tsx
│   ├── sections/          # Page sections
│   │   ├── ImmersiveHero.tsx
│   │   ├── AutomationFlow.tsx
│   │   └── ImmersivePortfolio.tsx
│   ├── dom/               # DOM UI components
│   │   ├── Navbar.tsx
│   │   ├── LiquidCursor.tsx
│   │   └── Preloader.tsx
│   └── effects/           # Visual effects
│       ├── MorphingBlob.tsx
│       └── ScrollProgress.tsx
```

### Backend Stack (MCP)

```
mcp/
├── src/helpermcp/         # Core MCP generation engine
│   ├── agents/            # AI agent implementations
│   │   ├── scout.py       # Discovery agent
│   │   ├── architect.py   # Scoring agent
│   │   └── coder.py       # Code generation agent
│   ├── pipeline.py        # Main generation pipeline
│   └── main.py           # CLI entry point
├── scripts/
│   ├── mcp_worker.py     # Background worker
│   └── supabase_schema.sql # Database schema
└── pyproject.toml        # Python package config
```

---

<a id="features"></a>

## 🎨 Features

### Frontend Experience

- 🌊 **Smooth Scroll** - Lenis-powered inertial scrolling
- 🎭 **3D Scene** - Three.js with React Three Fiber
- ✨ **Fluid Cursor** - Custom liquid cursor with magnetic effects
- 🎬 **Scroll Animations** - GSAP ScrollTrigger choreography
- 🌐 **Interactive 3D** - Mouse-responsive 3D elements
- 🎨 **Glass Morphism** - Premium glass-like UI elements

### MCP Factory

- 🤖 **AI Agents** - Autonomous tool generation
- 🔍 **Smart Discovery** - Automatically finds SDKs & APIs
- 🏗️ **3D Scoring** - LLM Utility × Determinism × Token Efficiency
- 🐳 **Docker Verification** - Every tool is tested in isolation
- 📦 **Production Ready** - FastMCP-compliant output
- 🔄 **Self-Healing** - Auto-fixes failed generations

---

## 🛠️ Tech Stack

### Core Technologies

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Variables |
| **3D** | Three.js, React Three Fiber, Drei |
| **Animation** | GSAP, Framer Motion, Lenis |
| **Backend** | Python 3.12, FastMCP, LangGraph |
| **Database** | Supabase (PostgreSQL) |
| **AI/ML** | Anthropic Claude, Sentence Transformers |

### Key Dependencies

```json
{
  "@react-three/fiber": "^8.17",
  "@react-three/drei": "^9.115",
  "three": "^0.182",
  "gsap": "^3.14",
  "framer-motion": "^11.18",
  "lenis": "^1.3",
  "@supabase/supabase-js": "^2.89"
}
```

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build the Docker image
docker build -t context-bridge .

# Run
docker run -p 3000:3000 context-bridge
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🎮 MCP Factory Usage

### Generate MCP Server

```bash
# Generate tools for a service
cd mcp
python -m helpermcp generate "Stripe" --max-tools 10

# Or use the JIT mode for goal-driven generation
python -m helpermcp jit "Track my business expenses" --target stripe
```

### How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Scout     │────▶│  Architect  │────▶│    Coder    │
│  (Discover) │     │  (Score)    │     │  (Generate) │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   Sandbox   │
                                         │  (Verify)   │
                                         └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   Output    │
                                         │  server.py  │
                                         └─────────────┘
```

---

## 📝 Environment Variables

Create a `.env.local` file:

```bash
# Supabase (for MCP demo)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Anthropic (for AI generation)
ANTHROPIC_API_KEY=sk-ant-your-key

# MCP Configuration
HELPERMCP_LLM_PROVIDER=anthropic
HELPERMCP_LLM_MODEL=claude-sonnet-4-20250514
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [GSAP](https://greensock.com/gsap/) - Professional animation library
- [Lenis](https://lenis.studiofreight.com/) - Smooth scroll library
- [FastMCP](https://github.com/jlowin/fastmcp) - MCP server framework

---

<div align="center">

**[⬆ Back to Top](#-what-is-context-bridge)**

Made with ❤️ by Context Bridge

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00ffa3,50:00a8ff,100:7c3aed&height=100&section=footer"/>

</div>
