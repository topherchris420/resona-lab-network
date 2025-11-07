import { useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import FeedFilters from '@/components/FeedFilters';
import ParticleBackground from '@/components/ParticleBackground';
import AnimatedBackground from '@/components/AnimatedBackground';
import heroBackground from '@/assets/hero-background.jpg';

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
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <ParticleBackground />
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text animate-pulse-glow">Where ideas find</span>
              <br />
              <span className="text-foreground">their frequency</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A living network of open science and creation. Publish, share, and evolve frontier experiments together.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Publish experiments. Collaborate. Build the science of tomorrow.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Open-source network for scientists, engineers, and experimental creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <a href="https://github.com/Resonant-Intelligence-Lab" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 hover:scale-105 transition-all glow-primary">
                  Join the Beta
                </button>
              </a>
              <button className="px-8 py-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/20 transition-all">
                Browse Protocols
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* No Gatekeeping Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            An Open, Collaborative Ecosystem
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Resona is built on the principle of open access. No peer-review barriers, no gatekeeping. Just a global community of innovators sharing and building upon each other's work.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-2xl font-bold">Publish Instantly</h3>
            <p className="mt-2 text-muted-foreground">
              Share your protocols, experiments, and findings with the world in seconds.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20V10M12 10C12 7.79086 10.2091 6 8 6C5.79086 6 4 7.79086 4 10M12 10C12 7.79086 13.7909 6 16 6C18.2091 6 20 7.79086 20 10"/></svg>
            </div>
            <h3 className="text-2xl font-bold">Fork & Iterate</h3>
            <p className="mt-2 text-muted-foreground">
              Build upon existing work. Every project is a starting point for the next breakthrough.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold">Collaborate Globally</h3>
            <p className="mt-2 text-muted-foreground">
              Connect with researchers, engineers, and creators from around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Experiments Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Explore the Frontier
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Dive into some of the latest protocols and experiments being developed on Resona.
        </p>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mockProjects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </section>

      {/* Credibility Cues Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">
          Built by researchers • Open to creators & scientists
        </p>
        <div className="mt-8 flex justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-4xl font-bold">1,000+</p>
            <p className="text-muted-foreground">Active Researchers</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">500+</p>
            <p className="text-muted-foreground">Protocols Published</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">10,000+</p>
            <p className="text-muted-foreground">Collaborations</p>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <div className="glass-card rounded-xl p-4 animate-fade-in">
            <FeedFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Projects Feed */}
          <div className="space-y-6 stagger-children">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center py-8">
            <button className="px-6 py-3 rounded-xl border border-border/50 hover:border-primary/50 transition-colors text-foreground hover:text-primary">
              Load More Projects
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
