import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, GitFork, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ProjectDetail = () => {
  const { id } = useParams();

  // Mock data - in real app, fetch based on id
  const project = {
    title: 'Quantum Entanglement Visualization in Real-Time Neural Networks',
    author: 'Dr. Sarah Chen',
    authorBio: 'Quantum Computing Researcher | AI Scientist',
    abstract: 'Exploring the intersection of quantum mechanics and artificial neural networks through real-time visualization of entangled states.',
    tags: ['Quantum Computing', 'Neural Networks', 'Visualization'],
    resonanceCount: 342,
    forkCount: 45,
    commentCount: 78,
    createdAt: 'March 15, 2024',
    content: `
## Overview

This research explores how quantum entanglement properties can be visualized and leveraged in modern neural network architectures. We present a novel framework that bridges quantum mechanics principles with deep learning optimization.

## Methodology

Our approach combines three key innovations:

1. **Quantum State Encoding**: Using qubits to represent neural network weights
2. **Entanglement Mapping**: Visualizing correlations between quantum states
3. **Real-time Processing**: GPU-accelerated computation for live visualization

\`\`\`python
import qiskit
import tensorflow as tf

def quantum_neural_layer(input_qubits, weights):
    # Initialize quantum circuit
    qc = QuantumCircuit(input_qubits)
    
    # Apply entanglement gates
    for i in range(input_qubits):
        qc.h(i)
        if i < input_qubits - 1:
            qc.cx(i, i+1)
    
    return qc
\`\`\`

## Results

Our experiments demonstrate a 23% improvement in convergence speed compared to classical neural networks on specific optimization problems. The visualization framework reveals previously hidden patterns in the learning process.

## Implications

This work opens new avenues for:
- More efficient training algorithms
- Better understanding of neural network dynamics
- Novel quantum computing applications in AI

## Future Work

We are currently exploring applications in:
- Natural language processing
- Computer vision
- Reinforcement learning optimization
    `,
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {project.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    SC
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{project.author}</p>
                  <p className="text-sm">{project.authorBio}</p>
                </div>
              </div>
              <span className="text-sm">•</span>
              <span className="text-sm">{project.createdAt}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  {project.resonanceCount} Resonance
                </span>
                <span className="flex items-center gap-2">
                  <GitFork className="h-5 w-5" />
                  {project.forkCount} Forks
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {project.commentCount} Comments
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                  <Radio className="h-4 w-4" />
                  Resonate
                </Button>
                <Button variant="outline" className="gap-2">
                  <GitFork className="h-4 w-4" />
                  Fork
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Abstract</h2>
            <p className="text-foreground/80 leading-relaxed">{project.abstract}</p>
          </div>

          {/* Content */}
          <div className="glass-card rounded-xl p-8 prose prose-invert prose-cyan max-w-none">
            <div className="space-y-6 text-foreground/90">
              {project.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-foreground mt-8 mb-4">
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('```')) {
                  return null; // Handle code blocks separately
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <li key={i} className="ml-4 text-foreground/80">
                      {line.replace(/^\d+\.\s*/, '')}
                    </li>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={i} className="ml-4 text-foreground/80">
                      {line.replace(/^-\s*/, '')}
                    </li>
                  );
                }
                if (line.trim()) {
                  return (
                    <p key={i} className="leading-relaxed">
                      {line}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion ({project.commentCount})
            </h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No comments yet. Start the conversation!</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ProjectDetail;
