# Resona

**Where ideas find their frequency**

Resona is a next-generation open-source platform — a decentralized social network and research playground where scientists, engineers, and creators publish, share, and evolve frontier experiments together.

![Resona Logo](public/favicon.png)

## 🌌 Vision

Resona is the **GitHub + Reddit + Hugging Face** of future science — a living network for open discovery.

- Users post research notes, code, data, and prototypes
- Others can **Resonate** with or **Fork** projects to evolve them further  
- Every project contributes to the world's first social graph of scientific resonance

## ✨ Key Features

### 🔬 Research Publishing
- Markdown-based project pages with syntax highlighting
- Upload code, datasets, and research documentation
- AI-powered auto-summarization and tagging
- Support for multiple license types (open, remixable, attribution)

### 🔊 Social Resonance
- **Resonate** — Like projects that inspire you
- **Fork** — Create derivative works and evolutions
- **Discuss** — Collaborative comment threads
- Track resonance scores and scientific impact

### 👥 Community & Collaboration
- User profiles with resonance graphs
- Public Labs for team collaboration
- Follow researchers and topics
- Discover related projects through AI recommendations

### 🎨 Design Philosophy
- **Aesthetic**: Sleek, dark, minimal, and luminous
- **Colors**: Deep black with cyan, violet, and silver gradients
- **Motion**: Smooth animations and particle effects
- **Typography**: Modern, clean (Inter font family)
- **Background**: Animated particles representing live resonance

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone topherchris420/resona-lab-network

# Navigate to project directory
cd resona

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and design system
- **Shadcn UI** - Component library
- **React Router** - Navigation
- **Lucide Icons** - Icon system

### Design System
- Glass-morphism UI components
- Animated gradient backgrounds
- Particle system for visual effects
- Custom design tokens in HSL color space
- Responsive and accessible components

## 📁 Project Structure

```
resona/
├── public/               # Static assets
│   ├── favicon.png      # App icon
│   └── robots.txt       # SEO configuration
├── src/
│   ├── assets/          # Images and media
│   ├── components/      # React components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── Header.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ParticleBackground.tsx
│   │   └── AnimatedBackground.tsx
│   ├── pages/          # Route pages
│   │   ├── Home.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── Auth.tsx
│   │   └── Create.tsx
│   ├── lib/            # Utilities
│   ├── hooks/          # Custom React hooks
│   ├── index.css       # Global styles & design system
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── tailwind.config.ts  # Tailwind configuration
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## 🎨 Design System

### Colors
- **Background**: `hsl(240 15% 4%)` - Deep space black
- **Primary**: `hsl(190 100% 50%)` - Cyan/Electric blue
- **Secondary**: `hsl(270 70% 65%)` - Violet/Purple
- **Success**: `hsl(150 80% 50%)` - Emerald (for resonance)
- **Accent**: `hsl(210 20% 85%)` - Silver highlights

### Typography
- **Font Family**: Inter (with Helvetica fallbacks)
- **Letter Spacing**: Tight (-0.02em for headings)
- **Font Smoothing**: Antialiased for crisp rendering

### Animations
- Particle background system
- Animated gradient waves
- Fade-in and stagger animations
- Hover scale effects
- Pulse glow effects

## 🔑 Core Pages

### Home Feed
- Infinite scrolling feed of latest experiments
- Smart filters: Trending, New, Following, Experimental
- Real-time resonance counts
- Interactive project cards

### Project Detail
- Full markdown rendering with code syntax highlighting
- AI-generated summaries
- Resonance, fork, and discussion actions
- Author information and related projects

### User Profile
- Resonance score and statistics
- Project portfolio
- Fork history
- Collaboration network
- Visual resonance graph (coming soon)

### Create/Publish
- Markdown editor for research content
- Automatic abstract generation via AI
- Tag management (manual + AI-assisted)
- GitHub and dataset linking
- License selection

### Authentication
- Email/password signup and login
- Guest explore mode
- Future: Decentralized ID support (Lens, ENS, Ceramic)

## 🚧 Roadmap

### Phase 1: MVP (Current)
- [x] Core UI and design system
- [x] Project feed and filtering
- [x] Project detail pages
- [x] User profiles
- [x] Authentication flow
- [x] Publishing interface

### Phase 2: Backend Integration
- [ ] Connect to Lovable Cloud/Supabase
- [ ] User authentication system
- [ ] Project database and storage
- [ ] File upload for datasets and code
- [ ] Real-time updates

### Phase 3: AI Features
- [ ] OpenAI integration for summarization
- [ ] AI-powered tag suggestions
- [ ] Semantic search across projects
- [ ] Research assistant chatbot
- [ ] Idea-to-prototype converter

### Phase 4: Social & Collaboration
- [ ] Fork functionality with version tracking
- [ ] Comment threads and discussions
- [ ] Public Labs with real-time collaboration
- [ ] Following system
- [ ] Notifications

### Phase 5: Visualization
- [ ] 3D Resonance Graph (Three.js/D3.js)
- [ ] Interactive knowledge network
- [ ] Data visualization tools
- [ ] Live experiment dashboards

### Future Enhancements
- [ ] Decentralized storage (IPFS/Arweave)
- [ ] Blockchain integration for attribution
- [ ] Mobile apps (React Native)
- [ ] API for third-party integrations
- [ ] Plugin system for custom tools

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and patterns
- Use TypeScript for type safety
- Write descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is open source. License details coming soon.

## 🌐 Links

- **Website**: [resona.lovable.app](https://resona.lovable.app)
- **Documentation**: Coming soon
- **Community Discord**: Coming soon
- **GitHub**: This repository

## 💡 Philosophy

> "Resona is a living network of open science and creation."

We believe that the future of scientific discovery is:
- **Open** - Knowledge should be freely shared
- **Collaborative** - Great ideas emerge from connection
- **Dynamic** - Research evolves through iteration
- **Resonant** - Quality ideas naturally amplify

## 📧 Contact

For questions, suggestions, or collaboration opportunities:
- Create an issue in this repository
- Join our community channels (coming soon)
- Contact the team (details coming soon)

---

**Built with ❤️ by the Resona community**

*Vers3Dynamics | Meaning Machine | Resonance Intelligence*
