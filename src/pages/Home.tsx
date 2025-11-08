import { useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import FeedFilters from '@/components/FeedFilters';
import AnimatedBackground from '@/components/AnimatedBackground';

// Mock data
const mockProjects = [
  {
    id: '1',
    title: 'Quantum Entanglement Visualization in Real-Time Neural Networks',
    abstract: 'Exploring the intersection of quantum mechanics and artificial neural networks through real-time visualization of entangled states. This experiment demonstrates how quantum properties can be leveraged to enhance computational efficiency in deep learning architectures.',
    author: 'Dr. Sarah Chen',
    tags: ['Quantum Computing', 'Neural Networks', 'Visualization'],
    resonanceCount: 342,
    forkCount: 45,
    commentCount: 78,
    trending: true,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Biomimetic Algorithms for Swarm Intelligence',
    abstract: 'A novel approach to distributed problem-solving inspired by biological systems. We present a framework for coordinating autonomous agents using principles derived from ant colonies and bee hive behavior.',
    author: 'Prof. Marcus Webb',
    tags: ['Swarm Intelligence', 'Biomimetics', 'Distributed Systems'],
    resonanceCount: 289,
    forkCount: 32,
    commentCount: 56,
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    title: 'Cymatics: Sound Wave Patterns and Material Science Applications',
    abstract: 'Investigating how sound frequencies create geometric patterns in various materials. This research has implications for manufacturing processes, acoustic engineering, and understanding natural pattern formation.',
    author: 'Dr. Elena Rodriguez',
    tags: ['Cymatics', 'Acoustics', 'Material Science'],
    resonanceCount: 234,
    forkCount: 28,
    commentCount: 41,
    trending: true,
    createdAt: '8 hours ago',
  },
  {
    id: '4',
    title: 'Neuroplasticity Enhancement Through Synchronized Brain Stimulation',
    abstract: 'A breakthrough protocol for accelerating neural pathway formation using precisely timed electrical stimulation. Early trials show promising results for learning acceleration and cognitive enhancement.',
    author: 'Dr. James Park',
    tags: ['Neuroscience', 'Brain Stimulation', 'Cognition'],
    resonanceCount: 456,
    forkCount: 67,
    commentCount: 92,
    createdAt: '12 hours ago',
  },
  {
    id: '5',
    title: 'Self-Organizing Molecular Machines for Targeted Drug Delivery',
    abstract: 'Development of autonomous molecular-scale robots capable of navigating biological systems and delivering therapeutic payloads to specific cell types with unprecedented precision.',
    author: 'Dr. Yuki Tanaka',
    tags: ['Nanotechnology', 'Medicine', 'Molecular Biology'],
    resonanceCount: 512,
    forkCount: 73,
    commentCount: 105,
    trending: true,
    createdAt: '1 day ago',
  },
];

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('trending');

  return (
    <div className="min-h-screen bg-background scanline-overlay">
      <AnimatedBackground />
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="retro-panel p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-display text-primary tracking-widest">
            RESONA
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            A NETWORK FOR OPEN SCIENCE & CREATION
          </p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            PUBLISH EXPERIMENTS. COLLABORATE. BUILD THE FUTURE.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <a href="https://github.com/Resonant-Intelligence-Lab" target="_blank" rel="noopener noreferrer">
              <button className="retro-button">
                JOIN_THE_BETA
              </button>
            </a>
            <a href="https://vers3dynamics.com" target="_blank" rel="noopener noreferrer">
              <button className="retro-button">
                Vers3Dynamics
              </button>
            </a>
          </div>
        </section>

        <div className="text-center text-accent font-display text-lg">
          -=[ &#x269B; ]=-
        </div>

        {/* Featured Experiments Section */}
        <section className="retro-panel p-8">
          <h2 className="text-xl md:text-2xl font-display text-center text-accent">
            FEATURED EXPERIMENTS
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </section>

        <div className="text-center text-accent font-display text-lg">
          -=[ &#x269B; ]=-
        </div>

        {/* Credibility Cues Section */}
        <section className="retro-panel p-8 text-center">
          <p className="text-base md:text-lg text-muted-foreground">
            BUILT BY RESEARCHERS ++ OPEN TO CREATORS & SCIENTISTS
          </p>
          <div className="mt-8 flex flex-col md:flex-row justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display text-primary">1,000+</p>
              <p className="text-sm md:text-base text-muted-foreground">ACTIVE RESEARCHERS</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display text-primary">500+</p>
              <p className="text-sm md:text-base text-muted-foreground">PROTOCOLS PUBLISHED</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display text-primary">10,000+</p>
              <p className="text-sm md:text-base text-muted-foreground">COLLABORATIONS</p>
            </div>
          </div>
        </section>

        <div className="text-center text-accent font-display text-lg">
          -=[ &#x269B; ]=-
        </div>

        {/* Feed Section */}
        <section className="retro-panel p-8">
          <h2 className="text-2xl font-display text-center text-accent">
            LIVE FEED
          </h2>
          <div className="mt-8 space-y-6">
            <div className="retro-panel p-4">
              <FeedFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>

            <div className="space-y-6">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            <div className="text-center pt-8">
              <button className="retro-button">
                LOAD_MORE
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
