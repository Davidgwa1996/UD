import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';

// ============================================
// MAIN DYNAMIC BACKGROUND COMPONENT
// ============================================

const DynamicBackground = ({ 
  variant = 'gradient',           // gradient, particles, mesh, waves, aurora, geometric
  intensity = 0.6,                // 0 to 1
  speed = 1,                      // 0.5 to 2
  colors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  interactive = true,             // mouse interaction
  blur = 100,                     // blur amount for glow effects
  children,
  className = '',
  style = {}
}) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Mouse tracking for interactive backgrounds
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);
  
  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Render appropriate background variant
  const renderBackground = () => {
    switch (variant) {
      case 'particles':
        return <ParticleBackground 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
          mousePosition={mousePosition}
          dimensions={dimensions}
        />;
      case 'mesh':
        return <MeshGradient 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
          mousePosition={mousePosition}
        />;
      case 'waves':
        return <WaveBackground 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
        />;
      case 'aurora':
        return <AuroraBackground 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
          mousePosition={mousePosition}
        />;
      case 'geometric':
        return <GeometricBackground 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
          dimensions={dimensions}
        />;
      case 'gradient':
      default:
        return <GradientBackground 
          intensity={intensity} 
          speed={speed} 
          colors={colors}
          mousePosition={mousePosition}
        />;
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`dynamic-background ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        ...style
      }}
    >
      {renderBackground()}
      
      {/* Overlay to adjust intensity */}
      <div 
        className="background-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0,0,0,${1 - intensity})`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />
      
      {/* Children are rendered on top of background */}
      {children && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// GRADIENT BACKGROUND
// ============================================

const GradientBackground = ({ intensity, speed, colors, mousePosition }) => {
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(prev => (prev + 0.1 * speed) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [speed]);
  
  const gradientStyle = {
    position: 'absolute',
    inset: -50,
    background: `linear-gradient(${angle}deg, 
      ${colors[0]} ${40 + mousePosition.x * 10}%, 
      ${colors[1]} ${50 + mousePosition.y * 10}%, 
      ${colors[2]} ${60 + mousePosition.x * 10}%
    )`,
    filter: `blur(${80 * intensity}px)`,
    opacity: intensity,
    transform: `scale(1.1) translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
    transition: 'transform 0.1s ease-out'
  };
  
  return <motion.div 
    style={gradientStyle}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 20 / speed,
      repeat: Infinity,
      ease: "linear"
    }}
  />;
};

// ============================================
// PARTICLE BACKGROUND
// ============================================

const ParticleBackground = ({ intensity, speed, colors, mousePosition, dimensions }) => {
  const particleCount = Math.floor(50 * intensity);
  const particles = useRef([]);
  
  // Initialize particles
  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5 * speed,
        speedY: (Math.random() - 0.5) * 0.5 * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 5
      });
    }
  }
  
  return (
    <div className="particle-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {particles.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: particle.color,
            filter: `blur(${particle.size * 0.5}px)`,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: intensity * 0.5,
          }}
          animate={{
            x: [
              0,
              (Math.random() - 0.5) * 100 * intensity,
              (Math.random() - 0.5) * 100 * intensity,
              0
            ],
            y: [
              0,
              (Math.random() - 0.5) * 100 * intensity,
              (Math.random() - 0.5) * 100 * intensity,
              0
            ],
            scale: [1, 1.5, 0.8, 1],
            opacity: [intensity * 0.3, intensity * 0.8, intensity * 0.3],
          }}
          transition={{
            duration: 20 / speed,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Mouse attraction effect */}
      {mousePosition && (
        <motion.div
          style={{
            position: 'absolute',
            left: `${(mousePosition.x + 1) * 50}%`,
            top: `${(mousePosition.y + 1) * 50}%`,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors[0]}40, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};

// ============================================
// MESH GRADIENT BACKGROUND
// ============================================

const MeshGradient = ({ intensity, speed, colors, mousePosition }) => {
  const points = 5;
  const meshes = [];
  
  for (let i = 0; i < points; i++) {
    meshes.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[i % colors.length],
      size: Math.random() * 60 + 40
    });
  }
  
  return (
    <div className="mesh-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <filter id="mesh-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>
        
        {/* Create mesh gradient using multiple circles */}
        {meshes.map((mesh, index) => (
          <motion.circle
            key={index}
            cx={`${mesh.x}%`}
            cy={`${mesh.y}%`}
            r={mesh.size}
            fill={mesh.color}
            filter="url(#mesh-blur)"
            opacity={intensity * 0.3}
            animate={{
              cx: [
                `${mesh.x}%`,
                `${mesh.x + (mousePosition.x * 20)}%`,
                `${mesh.x}%`,
              ],
              cy: [
                `${mesh.y}%`,
                `${mesh.y + (mousePosition.y * 20)}%`,
                `${mesh.y}%`,
              ],
              r: [mesh.size, mesh.size * 1.2, mesh.size],
            }}
            transition={{
              duration: 10 / speed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// ============================================
// WAVE BACKGROUND
// ============================================

const WaveBackground = ({ intensity, speed, colors }) => {
  const waves = 5;
  
  return (
    <div className="wave-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.3} />
            <stop offset="50%" stopColor={colors[1]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={colors[2]} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        
        {[...Array(waves)].map((_, i) => (
          <motion.path
            key={i}
            d={`M0,${50 + i * 10} 
               C${20 + i * 5},${40 + i * 5} ${40 + i * 10},${60 + i * 5} ${60 + i * 15},${50 + i * 5}
               C${80 + i * 20},${40 + i * 5} ${100},${60 + i * 5} 100,${50 + i * 10}
               L100,100 L0,100 Z`}
            fill="url(#wave-gradient)"
            opacity={intensity * 0.2}
            animate={{
              d: [
                `M0,${50 + i * 10} C20,${40 + i * 5} 40,${60 + i * 5} 60,${50 + i * 5} C80,${40 + i * 5} 100,${60 + i * 5} 100,${50 + i * 10}`,
                `M0,${60 + i * 10} C30,${50 + i * 5} 50,${70 + i * 5} 70,${60 + i * 5} C90,${50 + i * 5} 100,${70 + i * 5} 100,${60 + i * 10}`,
                `M0,${50 + i * 10} C20,${40 + i * 5} 40,${60 + i * 5} 60,${50 + i * 5} C80,${40 + i * 5} 100,${60 + i * 5} 100,${50 + i * 10}`,
              ]
            }}
            transition={{
              duration: 15 / speed,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// ============================================
// AURORA BACKGROUND
// ============================================

const AuroraBackground = ({ intensity, speed, colors, mousePosition }) => {
  const layers = 4;
  
  return (
    <div className="aurora-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute' }}>
        <defs>
          <filter id="aurora-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
          </filter>
          <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.2} />
            <stop offset="50%" stopColor={colors[1]} stopOpacity={0.2} />
            <stop offset="100%" stopColor={colors[2]} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        
        {[...Array(layers)].map((_, i) => (
          <motion.rect
            key={i}
            x="-10%"
            y={`${i * 25}%`}
            width="120%"
            height="30%"
            fill="url(#aurora-gradient)"
            filter="url(#aurora-blur)"
            opacity={intensity * 0.15}
            animate={{
              y: [
                `${i * 25}%`,
                `${i * 25 + mousePosition.y * 20}%`,
                `${i * 25}%`,
              ],
              x: [
                '-10%',
                `${-10 + mousePosition.x * 10}%`,
                '-10%',
              ],
              rotate: [0, 2, -2, 0],
              scaleX: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 20 / speed,
              delay: i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// ============================================
// GEOMETRIC BACKGROUND
// ============================================

const GeometricBackground = ({ intensity, speed, colors, dimensions }) => {
  const shapes = 15;
  const shapeTypes = ['circle', 'square', 'triangle', 'hexagon'];
  
  return (
    <div className="geometric-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <filter id="geometric-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
        
        {[...Array(shapes)].map((_, i) => {
          const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
          const size = Math.random() * 100 + 50;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const rotation = Math.random() * 360;
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          let element;
          switch(type) {
            case 'circle':
              element = (
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={size / 2}
                  fill={color}
                  opacity={intensity * 0.1}
                  filter="url(#geometric-blur)"
                />
              );
              break;
            case 'square':
              element = (
                <rect
                  x={`${x - size/200}%`}
                  y={`${y - size/200}%`}
                  width={`${size/100}%`}
                  height={`${size/100}%`}
                  fill={color}
                  opacity={intensity * 0.1}
                  filter="url(#geometric-blur)"
                  transform={`rotate(${rotation}, ${x}%, ${y}%)`}
                />
              );
              break;
            case 'triangle':
              element = (
                <polygon
                  points={`${x}%,${y - size/150}% ${x - size/150}%,${y + size/300}% ${x + size/150}%,${y + size/300}%`}
                  fill={color}
                  opacity={intensity * 0.1}
                  filter="url(#geometric-blur)"
                  transform={`rotate(${rotation}, ${x}%, ${y}%)`}
                />
              );
              break;
            case 'hexagon':
              element = (
                <polygon
                  points={`${x}%,${y - size/150}% ${x + size/200}%,${y - size/300}% ${x + size/200}%,${y + size/300}% ${x}%,${y + size/150}% ${x - size/200}%,${y + size/300}% ${x - size/200}%,${y - size/300}%`}
                  fill={color}
                  opacity={intensity * 0.1}
                  filter="url(#geometric-blur)"
                  transform={`rotate(${rotation}, ${x}%, ${y}%)`}
                />
              );
              break;
            default:
              element = null;
          }
          
          return (
            <motion.g
              key={i}
              animate={{
                x: [0, (Math.random() - 0.5) * 5, 0],
                y: [0, (Math.random() - 0.5) * 5, 0],
                rotate: [0, (Math.random() - 0.5) * 10, 0],
                scale: [1, 1.1, 0.9, 1],
              }}
              transition={{
                duration: 15 / speed,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {element}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================
// ANIMATED GRADIENT TEXT (Utility Component)
// ============================================

// Note: This is NOT exported here to avoid duplicate export
const AnimatedGradientText = ({ 
  children, 
  colors = ['#3b82f6', '#8b5cf6', '#ec4899'],
  speed = 1,
  className = '',
  as: Component = 'span',
  ...props 
}) => {
  return (
    <motion.div
      className={`animated-gradient-text ${className}`}
      style={{
        background: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block'
      }}
      animate={{
        backgroundPosition: ['0% center', '200% center']
      }}
      transition={{
        duration: 5 / speed,
        repeat: Infinity,
        ease: "linear"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// EXPORT ALL
// ============================================

// Default export
export default DynamicBackground;

// Named exports for all components
export {
  GradientBackground,
  ParticleBackground,
  MeshGradient,
  WaveBackground,
  AuroraBackground,
  GeometricBackground,
  AnimatedGradientText  // This is the ONLY export of AnimatedGradientText
};