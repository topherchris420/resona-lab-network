import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { HypothesisGraph } from '@/lib/catalyst';

/* -------------------------------------------------------------------------- */
/*  Hypothesis graph — the Catalyst claim lattice rendered in the same 3D       */
/*  resonance language as the rest of Resona.                                  */
/* -------------------------------------------------------------------------- */

const NODE_STYLE: Record<string, { color: string; size: number }> = {
  concept: { color: '#06b6d4', size: 0.42 },
  objective: { color: '#8b5cf6', size: 0.36 },
  claim: { color: '#cbd5e1', size: 0.3 },
  evidence_needed: { color: '#fbbf24', size: 0.22 },
  metric: { color: '#34d399', size: 0.22 },
  falsifier: { color: '#f43f5e', size: 0.24 },
};

interface Placed {
  id: string;
  label: string;
  type: string;
  status?: string;
  position: [number, number, number];
}

/** Deterministic layered layout: one ring per node type. */
function layout(graph: HypothesisGraph): Placed[] {
  const groups = new Map<string, HypothesisGraph['nodes']>();
  graph.nodes.forEach((node) => {
    const list = groups.get(node.type) ?? [];
    list.push(node);
    groups.set(node.type, list);
  });

  const order = ['concept', 'objective', 'claim', 'evidence_needed', 'metric', 'falsifier'];
  const placed: Placed[] = [];

  order.forEach((type, layer) => {
    const list = groups.get(type) ?? [];
    const radius = layer === 0 ? 0 : 1.1 + layer * 0.95;
    list.forEach((node, i) => {
      const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 + layer * 0.6;
      placed.push({
        id: node.id,
        label: node.label,
        type: node.type,
        status: node.status,
        position: [
          Math.cos(angle) * radius,
          (layer - 2.2) * 0.85 + (i % 2 === 0 ? 0.18 : -0.18),
          Math.sin(angle) * radius,
        ],
      });
    });
  });

  // Any unexpected node type still gets a slot.
  graph.nodes
    .filter((n) => !order.includes(n.type))
    .forEach((node, i) => {
      placed.push({ id: node.id, label: node.label, type: node.type, position: [i * 0.6 - 2, 3, 0] });
    });

  return placed;
}

function GraphNode({
  node,
  active,
  onSelect,
}: {
  node: Placed;
  active: boolean;
  onSelect: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const style = NODE_STYLE[node.type] ?? { color: '#94a3b8', size: 0.24 };

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2 + node.position[0]) * 0.06;
    meshRef.current.scale.setScalar(active ? pulse * 1.45 : pulse);
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => onSelect(node.id)}
        onPointerOut={() => onSelect(null)}
      >
        <sphereGeometry args={[style.size, 24, 24]} />
        <meshStandardMaterial
          color={style.color}
          emissive={style.color}
          emissiveIntensity={active ? 1.6 : 0.6}
          roughness={0.3}
        />
      </mesh>
      {active && (
        <Html distanceFactor={9} center>
          <div className="pointer-events-none max-w-[220px] rounded-md border border-border bg-card/95 px-2 py-1 text-[11px] leading-snug text-foreground shadow-lg">
            <span className="block text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {node.type.replace(/_/g, ' ')}
              {node.status ? ` · ${node.status}` : ''}
            </span>
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Edges({ nodes, graph }: { nodes: Placed[]; graph: HypothesisGraph }) {
  const lines = useMemo(() => {
    const positions = new Map(nodes.map((n) => [n.id, n.position] as const));
    return graph.edges
      .map((edge) => {
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        if (!from || !to) return null;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...from),
          new THREE.Vector3(...to),
        ]);
        const material = new THREE.LineBasicMaterial({ color: '#8b5cf6', transparent: true, opacity: 0.35 });
        return new THREE.Line(geometry, material);
      })
      .filter((l): l is THREE.Line => l !== null);
  }, [nodes, graph]);

  return (
    <>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}


export default function HypothesisGraph3D({ graph }: { graph: HypothesisGraph }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const nodes = useMemo(() => layout(graph), [graph]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border-2 border-border bg-background/60">
      <Canvas camera={{ position: [0, 1.5, 9], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[6, 6, 6]} intensity={1.2} />
        <pointLight position={[-6, -4, -6]} intensity={0.6} color="#06b6d4" />
        <Edges nodes={nodes} graph={graph} />
        {nodes.map((node) => (
          <GraphNode key={node.id} node={node} active={activeId === node.id} onSelect={setActiveId} />
        ))}
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} minDistance={4} maxDistance={16} />
      </Canvas>
    </div>
  );
}
