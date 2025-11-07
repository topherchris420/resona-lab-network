import { useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import FeedFilters from '@/components/FeedFilters';
import ParticleBackground from '@/components/ParticleBackground';
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
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="gradient-text">Where ideas find</span>
              <br />
              <span className="text-foreground">their frequency</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A living network of open science and creation. Publish, share, and evolve frontier experiments together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary">
                Join the Beta
              </button>
              <button className="px-8 py-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                Explore Projects
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <div className="glass-card rounded-xl p-4">
            <FeedFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Projects Feed */}
          <div className="space-y-6">
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
