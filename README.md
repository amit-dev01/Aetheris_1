# 🌌 Aetheris Frontend

Aetheris is an AI-powered Business & Competitive Intelligence Agent. This frontend provides a modern, responsive, and dynamic dashboard to track competitors, consume real-time market intelligence, and generate AI-driven strategic briefs.

It is built to interface directly with the Aetheris FastAPI backend.

## 🚀 Features

- **🔒 Authentication Flow**: Full JWT-based secure login and signup process.
- **🏢 Company Onboarding**: Guided setup process to capture company profile, target audience, and industry for personalized intelligence.
- **📊 Competitor Dashboard**: Track and manage direct, indirect, and emerging competitors. Includes a manual add option and AI auto-discovery.
- **📰 Market Intelligence Feed**: A real-time, filterable feed of intelligence events regarding your competitors, categorized by impact (Critical, High, Medium, Low).
- **🧠 AI Strategy Brief**: Generate deep, AI-driven weekly strategy briefs with top threats, strategic opportunities, and actionable recommendations.
- **⚙️ Settings & Management**: Manage monitoring preferences, update company profiles, and toggle email/alert settings.

## 🛠️ Technology Stack

- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: Single-page application logic via React state / Context API
- **API Communication**: Custom native fetch wrapper (`api.js`) with integrated JWT Auth token injection.

## ⚙️ Environment Variables

Create a `.env` file in the root of the project with the following:

```env
# The base URL of your FastAPI backend (e.g., http://localhost:8000 for local development)
VITE_API_BASE_URL=https://ai-backend-zfq1.onrender.com
```

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aetheris-frontend.git
   cd aetheris-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will typically be available at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready static files will be generated in the `dist` directory.

## 📂 Project Structure

```
src/
├── api.js                   # Centralized API service with auth & error handling
├── constants.js             # Shared data constants (e.g. industry options)
├── App.jsx                  # Main routing, Context Provider, and Sidebar shell
├── index.css                # Global Tailwind styles & dark mode configuration
└── components/              
    ├── AIAgentModal.jsx     # Global search/agent modal interface
    ├── AIStrategySection.jsx# Weekly AI Strategy Brief UI
    ├── AlertsSection.jsx    # (Upcoming) High-priority intelligence alerts
    ├── CompetitorsSection.jsx # Competitor management dashboard
    ├── MarketIntelligenceSection.jsx # Intelligence news feed
    ├── OnboardingFlow.jsx   # Multi-step setup wizard
    ├── ProcessingScreen.jsx # Loading screen for AI discovery
    └── SettingsSection.jsx  # Company & monitoring preferences
```

## 🎨 Design System

Aetheris utilizes a highly dynamic, glassmorphism-inspired design system with smooth micro-animations, vibrant badges, and an integrated **Dark Mode** toggle.

## 🤝 Integration Notes

The frontend tightly couples with a backend API. Key behavioral notes:
- **Polling**: Background tasks (like `POST /api/intelligence/trigger-monitoring`) trigger polling to `GET /api/intelligence/jobs` every 10 seconds to detect completion.
- **Error Handling**: API errors (like 400s or 500s) are caught globally in `api.js` and returned to components, which display them via the internal `showToast` UI alert system.
- **State Management**: Most global states (like company profile, active tab, stats) are held in `DbContext` located in `App.jsx`.

---

*Designed for the future of competitive intelligence.*
