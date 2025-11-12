import React, { useEffect, useRef } from 'react';

const GridCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gridPointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    // Grid configuration
    const gridSize = 40;
    const influenceRadius = 150;
    const springStrength = 0.05;
    const damping = 0.85;

    class GridPoint {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
      }

      update(mouseX, mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < influenceRadius) {
          const force = (influenceRadius - distance) / influenceRadius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 2;
          this.vy += Math.sin(angle) * force * 2;
        }

        // Spring back to original position
        this.vx += (this.baseX - this.x) * springStrength;
        this.vy += (this.baseY - this.y) * springStrength;

        // Apply damping
        this.vx *= damping;
        this.vy *= damping;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx, mouseX, mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let opacity = 0.15;
        let size = 2;

        if (distance < influenceRadius) {
          const influence = 1 - distance / influenceRadius;
          opacity = 0.15 + influence * 0.6;
          size = 2 + influence * 2;
        }

        ctx.fillStyle = `rgba(212, 165, 116, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initGrid = () => {
      gridPointsRef.current = [];
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          gridPointsRef.current.push(new GridPoint(x, y));
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mouseRef.current;

      // Update and draw grid points
      gridPointsRef.current.forEach(point => {
        point.update(mouseX, mouseY);
        point.draw(ctx, mouseX, mouseY);
      });

      // Draw connections
      const connectionDistance = gridSize * 1.5;
      ctx.strokeStyle = 'rgba(212, 165, 116, 0.08)';
      ctx.lineWidth = 1;

      for (let i = 0; i < gridPointsRef.current.length; i++) {
        const point1 = gridPointsRef.current[i];
        
        for (let j = i + 1; j < gridPointsRef.current.length; j++) {
          const point2 = gridPointsRef.current[j];
          const dx = point1.x - point2.x;
          const dy = point1.y - point2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 0.08 * (1 - distance / connectionDistance);
            ctx.strokeStyle = `rgba(212, 165, 116, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8
      }}
    />
  );
};

export default GridCanvas;
