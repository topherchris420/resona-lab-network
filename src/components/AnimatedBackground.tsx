import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Gradient waves that move across the screen
    let gradientOffset = 0;

    const animate = () => {
      // Create moving gradient background
      gradientOffset += 0.5;
      
      const gradient = ctx.createLinearGradient(
        gradientOffset, 
        0, 
        canvas.width + gradientOffset, 
        canvas.height
      );
      
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.03)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0.03)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      
      const gridSize = 60;
      const time = Date.now() * 0.0003;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const wave = Math.sin(x * 0.01 + y * 0.01 + time) * 10;
          ctx.beginPath();
          ctx.arc(x, y + wave, 1, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AnimatedBackground;
