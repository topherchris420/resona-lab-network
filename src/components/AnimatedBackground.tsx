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
    let ripples: { createdAt: number }[] = [];
    let lastRippleTime = 0;


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
      const time = Date.now();
      const timeSeconds = time * 0.0003;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const wave = Math.sin(x * 0.01 + y * 0.01 + timeSeconds) * 10;
          ctx.beginPath();
          ctx.arc(x, y + wave, 1, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw cymatic ripples
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (time - lastRippleTime > 2000) {
        ripples.push({ createdAt: time });
        lastRippleTime = time;
      }

      ripples = ripples.filter(ripple => {
        const age = (time - ripple.createdAt) / 1000; // age in seconds
        const radius = age * 100; // ripple speed
        const opacity = Math.max(0, 1 - age / 4); // fade out over 4 seconds

        if (opacity === 0) {
          return false; // remove old ripple
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        return true;
      });

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
