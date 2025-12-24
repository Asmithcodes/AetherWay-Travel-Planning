# AetherWays - AI-Powered Route Comparison Engine

An intelligent travel planning application that compares flights, trains, buses, and self-drive options in real-time. Powered by Google Gemini AI with grounded search capabilities.

## ✨ Features

- 🤖 **AI-Powered Route Planning** - Google Gemini AI finds optimal routes with live pricing
- 🔍 **Grounded Search** - Real-time data from actual booking platforms
- 🚂 **Multi-Modal Transport** - Compare flights, trains, buses, and self-drive options
- 💰 **Cost Breakdown** - Detailed pricing analysis for each route
- 🎨 **Kinetic UI** - Beautiful animated interface with gooey navigation
- 🌙 **Dark Theme** - Eye-friendly dark mode design
- 👤 **User Authentication** - Secure login with Supabase
- ⭐ **Favorites & History** - Save and track your searches
- 📊 **Visual Comparisons** - Charts for price and duration analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Cloudflare account (for API proxy)
- Supabase account (for authentication)
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Asmithcodes/AetherWay-Travel-Planning.git
cd AetherWay-Travel-Planning

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

### Environment Variables

Create a `.env` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Cloudflare Worker URL (after deployment)
VITE_WORKER_URL=https://aetherways-api-proxy.your-subdomain.workers.dev
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Cloudflare Worker Setup (API Security)

The app uses a Cloudflare Worker to proxy API requests and hide your Google API key.

### Step 1: Install Wrangler

```bash
cd cloudflare-worker
npm install
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

### Step 3: Add API Key Secret

```bash
npx wrangler secret put API_KEY
# Paste your Google Gemini API key when prompted
```

### Step 4: Deploy Worker

```bash
npx wrangler deploy
```

Copy the deployed Worker URL (e.g., `https://aetherways-api-proxy.your-subdomain.workers.dev`) and add it to your `.env` as `VITE_WORKER_URL`.

## 📦 Deployment

### GitHub Pages

1. **Enable GitHub Pages:**
   - Go to Repository Settings → Pages
   - Source: GitHub Actions

2. **Add Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_WORKER_URL`

3. **Push to main branch:**
   ```bash
   git push origin main
   ```

The GitHub Action will automatically build and deploy to:
`https://asmithcodes.github.io/AetherWay-Travel-Planning/`

### Netlify

1. **Connect Repository:**
   - Import your GitHub repository in Netlify

2. **Configure Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables:**
   - Add the same variables from `.env.example`

4. **Deploy:**
   - Netlify will auto-deploy on every push

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI:** Google Gemini API
- **Auth & Database:** Supabase
- **State Management:** Zustand
- **Charts:** Recharts
- **API Proxy:** Cloudflare Workers
- **Deployment:** GitHub Pages / Netlify

## 📁 Project Structure

```
aetherways/
├── components/
│   ├── Background/       # Kinetic background animations
│   ├── Navigation/       # Gooey navigation component
│   ├── UI/              # Reusable UI components
│   └── ...
├── services/
│   ├── geminiService.ts  # AI route generation
│   ├── databaseService.ts # Supabase operations
│   └── supabaseClient.ts
├── store/
│   └── authStore.ts      # Zustand auth state
├── cloudflare-worker/
│   ├── src/index.ts      # Worker proxy logic
│   └── wrangler.toml     # Worker configuration
├── .github/workflows/
│   └── deploy.yml        # GitHub Pages deployment
└── App.tsx               # Main application
```

## 🔧 API Override System

If the Cloudflare Worker API key expires or reaches quota limits, users can enter their own Google API key through the Settings modal. The app implements a graceful fallback system:

1. Primary: Cloudflare Worker proxy
2. Fallback: User-provided API key (stored in localStorage)
3. Error: Contact developer at `asmyth@duck.com`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

**Developed by Asmith**  
📧 [asmyth@duck.com](mailto:asmyth@duck.com)

---

**Note:** Remember to never commit your `.env` file. Always use environment variables for sensitive data.
