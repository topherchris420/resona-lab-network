import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface TopicNode {
  id: string;
  label: string;
  category: string;
  resonance: number;
  position: [number, number, number];
  color: string;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

// Generate mock topic data
const generateTopicData = (): { nodes: TopicNode[]; connections: Connection[] } => {
  const categories = [
    { name: 'Quantum', color: '#00ffff' },
    { name: 'AI/ML', color: '#ff00ff' },
    { name: 'Biology', color: '#00ff88' },
    { name: 'Physics', color: '#ffaa00' },
    { name: 'Chemistry', color: '#ff6666' },
  ];

  const topics = [
    { label: 'Quantum Computing', category: 'Quantum', resonance: 95 },
    { label: 'Entanglement', category: 'Quantum', resonance: 88 },
    { label: 'Neural Networks', category: 'AI/ML', resonance: 92 },
    { label: 'Deep Learning', category: 'AI/ML', resonance: 85 },
    { label: 'Transformers', category: 'AI/ML', resonance: 78 },
    { label: 'CRISPR', category: 'Biology', resonance: 82 },
    { label: 'Genomics', category: 'Biology', resonance: 75 },
    { label: 'Neuroplasticity', category: 'Biology', resonance: 68 },
    { label: 'Dark Matter', category: 'Physics', resonance: 70 },
    { label: 'String Theory', category: 'Physics', resonance: 65 },
    { label: 'Nanotechnology', category: 'Chemistry', resonance: 80 },
    { label: 'Molecular Design', category: 'Chemistry', resonance: 72 },
  ];

  const nodes: TopicNode[] = topics.map((topic, i) => {
    const angle = (i / topics.length) * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 4;
    const cat = categories.find(c => c.name === topic.category)!;
    
    return {
      id: `topic-${i}`,
      label: topic.label,
      category: topic.category,
      resonance: topic.resonance,
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      color: cat.color,
    };
  });

  // Generate connections between related topics
  const connections: Connection[] = [];
  
  // Connect topics in same category
  nodes.forEach((node, i) => {
    nodes.forEach((other, j) => {
      if (i < j && node.category === other.category) {
        connections.push({
          from: node.id,
          to: other.id,
          strength: 0.8 + Math.random() * 0.2,
        });
      }
    });
  });

  // Add some cross-category connections
  const crossConnections = [
    ['topic-0', 'topic-2'], // Quantum + Neural Networks
    ['topic-1', 'topic-3'], // Entanglement + Deep Learning
    ['topic-5', 'topic-10'], // CRISPR + Nanotechnology
    ['topic-7', 'topic-2'], // Neuroplasticity + Neural Networks
    ['topic-10', 'topic-0'], // Nanotechnology + Quantum Computing
  ];

  crossConnections.forEach(([from, to]) => {
    connections.push({ from, to, strength: 0.5 + Math.random() * 0.3 });
  });

  return { nodes, connections };
};

// Individual node component
function TopicNodeMesh({ 
  node, 
  isHovered, 
  isSelected,
  onHover, 
  onSelect 
}: { 
  node: TopicNode;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const scale = useMemo(() => {
    const base = 0.15 + (node.resonance / 100) * 0.25;
    if (isSelected) return base * 1.5;
    if (isHovered) return base * 1.3;
    return base;
  }, [node.resonance, isHovered, isSelected]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime + node.position[0]) * 0.1;
    }
    if (glowRef.current) {
      // Pulse the glow
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(scale * 2 * pulseScale);
    }
  });

  return (
    <group position={node.position}>
      {/* Glow effect */}
      <mesh ref={glowRef} scale={scale * 2}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={node.color} 
          transparent 
          opacity={isHovered || isSelected ? 0.3 : 0.15} 
        />
      </mesh>
      
      {/* Main node */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); onHover(node.id); }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : node.id); }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={node.color} 
          emissive={node.color}
          emissiveIntensity={isHovered || isSelected ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Label */}
      {(isHovered || isSelected) && (
        <Html
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 text-sm shadow-lg">
            <div className="font-semibold text-foreground">{node.label}</div>
            <div className="text-xs text-muted-foreground">
              {node.category} • Resonance: {node.resonance}%
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection lines between nodes
function ConnectionLine({ 
  from, 
  to, 
  strength,
  isHighlighted 
}: { 
  from: [number, number, number];
  to: [number, number, number];
  strength: number;
  isHighlighted: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        (from[1] + to[1]) / 2 + 0.5,
        (from[2] + to[2]) / 2
      ),
      new THREE.Vector3(...to)
    );
    const points = curve.getPoints(20);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [from, to]);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = isHighlighted 
        ? 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        : 0.2 + strength * 0.3;
    }
  });

  return (
    <primitive 
      object={new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ 
          color: isHighlighted ? "#00ffff" : "#666666", 
          transparent: true, 
          opacity: 0.3 
        })
      )}
      ref={lineRef}
    />
  );
}

// Main scene component
function Scene() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const { nodes, connections } = useMemo(() => generateTopicData(), []);

  const getNodePosition = useCallback((id: string) => {
    return nodes.find(n => n.id === id)?.position || [0, 0, 0] as [number, number, number];
  }, [nodes]);

  const isConnectionHighlighted = useCallback((conn: Connection) => {
    const activeNode = selectedNode || hoveredNode;
    return activeNode ? (conn.from === activeNode || conn.to === activeNode) : false;
  }, [hoveredNode, selectedNode]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      
      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          from={getNodePosition(conn.from)}
          to={getNodePosition(conn.to)}
          strength={conn.strength}
          isHighlighted={isConnectionHighlighted(conn)}
        />
      ))}

      {/* Topic nodes */}
      {nodes.map((node) => (
        <TopicNodeMesh
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          isSelected={selectedNode === node.id}
          onHover={setHoveredNode}
          onSelect={setSelectedNode}
        />
      ))}

      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={!hoveredNode && !selectedNode}
        autoRotateSpeed={0.5}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
}

// Category legend
function Legend() {
  const categories = [
    { name: 'Quantum', color: '#00ffff' },
    { name: 'AI/ML', color: '#ff00ff' },
    { name: 'Biology', color: '#00ff88' },
    { name: 'Physics', color: '#ffaa00' },
    { name: 'Chemistry', color: '#ff6666' },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-foreground mb-2">Categories</h4>
      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}` }}
            />
            <span className="text-xs text-muted-foreground">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Instructions overlay
function Instructions() {
  return (
    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 max-w-xs">
      <h4 className="text-sm font-semibold text-foreground mb-2">Controls</h4>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li>🖱️ Drag to rotate</li>
        <li>📍 Click node to select</li>
        <li>🔍 Scroll to zoom</li>
        <li>⏸️ Hover to pause rotation</li>
      </ul>
    </div>
  );
}

// Main exported component
export default function ResonanceGraph3D() {
  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-primary/20 bg-background">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 8, 20]} />
        <Scene />
      </Canvas>
      <Legend />
      <Instructions />
    </div>
  );
}
