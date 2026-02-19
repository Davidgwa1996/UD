import { Variants } from 'framer-motion';

// ============================================
// ENTRANCE ANIMATIONS
// ============================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1,
      delay: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0.5 },
  animate: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    rotate: 180, 
    scale: 0.5,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

export const zoomIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.3,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const flipIn = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { 
    opacity: 1, 
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    rotateY: 90,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      staggerDirection: 1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      delayChildren: 0
    }
  }
};

export const staggerFast = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
      staggerDirection: 1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

export const staggerSlow = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      staggerDirection: 1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

export const staggerGrid = (rows = 1, cols = 4) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
      staggerDirection: 1
    }
  }
});

export const staggerList = {
  initial: { opacity: 0 },
  animate: (i) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: i * 0.1
    }
  })
};

// ============================================
// HOVER ANIMATIONS
// ============================================

export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  },
  whileTap: { 
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  }
};

export const hoverLift = {
  whileHover: { 
    y: -5,
    boxShadow: "0 10px 30px -10px rgba(59,130,246,0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  },
  whileTap: { 
    y: 0,
    boxShadow: "0 5px 15px -5px rgba(59,130,246,0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  }
};

export const hoverGlow = {
  whileHover: { 
    scale: 1.02,
    boxShadow: "0 0 20px rgba(59,130,246,0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  }
};

export const hoverRotate = {
  whileHover: { 
    rotate: 5,
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      mass: 0.5
    }
  }
};

export const hover3DTilt = {
  whileHover: { 
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 0.5
    }
  }
};

export const hoverScaleRotate = {
  whileHover: { 
    scale: 1.1,
    rotate: 2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

export const hoverBounce = {
  whileHover: { 
    y: [0, -5, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity
    }
  }
};

// ============================================
// CARD ANIMATIONS
// ============================================

export const cardHover = {
  whileHover: { 
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px -12px rgba(59,130,246,0.4)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.8
    }
  },
  whileTap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.8
    }
  }
};

export const cardEntrance = (index = 0) => ({
  initial: { 
    opacity: 0, 
    y: 50,
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      mass: 1,
      delay: index * 0.05
    }
  },
  whileHover: { 
    y: -5,
    scale: 1.02,
    boxShadow: "0 15px 30px -10px rgba(59,130,246,0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
      mass: 0.5
    }
  }
});

export const card3D = {
  initial: { 
    opacity: 0,
    rotateY: 45,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  whileHover: { 
    rotateY: 5,
    rotateX: 5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition = {
  initial: { 
    opacity: 0,
    scale: 0.98,
    filter: "blur(10px)"
  },
  animate: { 
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  exit: { 
    opacity: 0,
    scale: 1.02,
    filter: "blur(10px)",
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

export const slideTransition = {
  initial: { 
    x: 300,
    opacity: 0
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  },
  exit: { 
    x: -300,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
};

export const slideUpTransition = {
  initial: { 
    y: 100,
    opacity: 0
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const modalTransition = {
  initial: { 
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const fadeScaleTransition = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// ============================================
// BACKGROUND ANIMATIONS
// ============================================

export const morphBackground = {
  animate: {
    background: [
      'linear-gradient(45deg, #3b82f6, #8b5cf6)',
      'linear-gradient(135deg, #8b5cf6, #ec4899)',
      'linear-gradient(225deg, #ec4899, #3b82f6)',
      'linear-gradient(315deg, #3b82f6, #8b5cf6)'
    ],
    transition: {
      duration: 10,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "linear"
    }
  }
};

export const pulseBackground = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const gradientShift = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 100%'],
    transition: {
      duration: 15,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "linear"
    }
  }
};

export const rotateBackground = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const waveBackground = {
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// FLOATING ANIMATIONS
// ============================================

export const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const floatWithRotate = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const bounce = {
  animate: {
    y: [0, -15, 0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const sway = {
  animate: {
    rotate: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// TEXT ANIMATIONS
// ============================================

export const textGradient = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const textGlow = {
  animate: {
    textShadow: [
      '0 0 8px rgba(59,130,246,0.3)',
      '0 0 16px rgba(59,130,246,0.6)',
      '0 0 8px rgba(59,130,246,0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const textWave = {
  animate: {
    y: [0, -3, 0, 3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const textShake = {
  animate: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity
    }
  }
};

export const textReveal = {
  initial: { 
    y: '100%',
    opacity: 0
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// ============================================
// LOADING ANIMATIONS
// ============================================

export const loadingPulse = {
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.98, 1, 0.98],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const loadingSpinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const loadingShimmer = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const loadingDots = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const loadingProgress = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// SCROLL ANIMATIONS
// ============================================

export const scrollParallax = (speed = 0.5) => ({
  initial: { y: 0 },
  whileInView: { 
    y: (scrollY) => scrollY * speed,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 30
    }
  }
});

export const scrollReveal = {
  initial: { 
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  whileInView: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay: 0.1
    }
  },
  viewport: { once: true, margin: "-100px" }
};

export const scrollFade = {
  initial: { 
    opacity: 0,
    y: 30
  },
  whileInView: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  viewport: { once: true, margin: "-50px" }
};

export const scrollScale = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  whileInView: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  viewport: { once: true, margin: "-100px" }
};

// ============================================
// INTERACTIVE ANIMATIONS
// ============================================

export const magnetic = {
  whileHover: { 
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.5
    }
  }
};

export const ripple = {
  whileTap: {
    scale: 0.9,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.5
    }
  }
};

export const shake = {
  whileHover: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.3
    }
  }
};

export const pop = {
  whileTap: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.2
    }
  }
};

export const wiggle = {
  whileHover: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4
    }
  }
};

// ============================================
// PRODUCT SPECIFIC ANIMATIONS
// ============================================

export const priceChange = (trend = 'neutral') => ({
  animate: {
    scale: [1, 1.1, 1],
    color: trend === 'up' ? ['#22c55e', '#4ade80', '#22c55e'] : 
           trend === 'down' ? ['#ef4444', '#f87171', '#ef4444'] : 
           ['#94a3b8', '#cbd5e1', '#94a3b8'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
});

export const stockIndicator = (stock = 0) => ({
  animate: stock < 5 ? {
    scale: [1, 1.1, 1],
    backgroundColor: ['#ef4444', '#dc2626', '#ef4444'],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {}
});

export const productCardHover = {
  whileHover: { 
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 40px -12px rgba(59,130,246,0.4)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};

export const addToCartAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.5
    }
  }
};

// ============================================
// CAROUSEL ANIMATIONS
// ============================================

export const carouselSlide = (direction = 1) => ({
  enter: {
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotate: direction > 0 ? 10 : -10
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 }
    }
  },
  exit: {
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    rotate: direction < 0 ? 10 : -10,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 }
    }
  }
});

export const carouselFade = {
  enter: {
    opacity: 0,
    scale: 0.9
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3
    }
  }
};

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================

export const notification = {
  initial: { 
    x: 300,
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    x: 300,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const notificationSlide = {
  initial: { 
    y: -100,
    opacity: 0
  },
  animate: { 
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================
// MENU ANIMATIONS
// ============================================

export const menuSlide = {
  initial: { 
    x: '-100%',
    opacity: 0
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const menuFade = {
  initial: { 
    opacity: 0,
    y: -20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren"
    }
  }
};

export const menuItemSlide = {
  initial: { 
    x: -20,
    opacity: 0
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    x: -20,
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const createStaggerDelay = (index = 0, baseDelay = 0.05) => ({
  transition: {
    delay: index * baseDelay
  }
});

export const createRandomFloat = (range = 10) => ({
  animate: {
    y: [0, -range, 0, range, 0],
    transition: {
      duration: Math.random() * 3 + 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
});

export const createParallax = (scrollY, range = 100) => ({
  y: scrollY * range
});

export const createSequence = (steps = [], delay = 0.1) => ({
  animate: steps.reduce((acc, step, i) => ({
    ...acc,
    [step.prop]: step.value,
    transition: {
      delay: i * delay,
      ...step.transition
    }
  }), {})
});

export const createParticles = (count = 20) => {
  return Array.from({ length: count }).map((_, i) => ({
    initial: {
      x: Math.random() * 100 + '%',
      y: Math.random() * 100 + '%',
      scale: 0
    },
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 0.5, 0],
      transition: {
        duration: Math.random() * 3 + 2,
        delay: i * 0.1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }));
};

// ============================================
// EXPORT ALL AS SINGLE OBJECT
// ============================================

const AnimationPresets = {
  // Entrance
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  rotateIn,
  zoomIn,
  flipIn,
  
  // Stagger
  staggerContainer,
  staggerFast,
  staggerSlow,
  staggerGrid,
  staggerList,
  
  // Hover
  hoverScale,
  hoverLift,
  hoverGlow,
  hoverRotate,
  hover3DTilt,
  hoverScaleRotate,
  hoverBounce,
  
  // Card
  cardHover,
  cardEntrance,
  card3D,
  
  // Page
  pageTransition,
  slideTransition,
  slideUpTransition,
  modalTransition,
  fadeScaleTransition,
  
  // Background
  morphBackground,
  pulseBackground,
  gradientShift,
  rotateBackground,
  waveBackground,
  
  // Floating
  float,
  floatWithRotate,
  pulse,
  bounce,
  sway,
  
  // Text
  textGradient,
  textGlow,
  textWave,
  textShake,
  textReveal,
  
  // Loading
  loadingPulse,
  loadingSpinner,
  loadingShimmer,
  loadingDots,
  loadingProgress,
  
  // Scroll
  scrollParallax,
  scrollReveal,
  scrollFade,
  scrollScale,
  
  // Interactive
  magnetic,
  ripple,
  shake,
  pop,
  wiggle,
  
  // Product
  priceChange,
  stockIndicator,
  productCardHover,
  addToCartAnimation,
  
  // Carousel
  carouselSlide,
  carouselFade,
  
  // Notification
  notification,
  notificationSlide,
  
  // Menu
  menuSlide,
  menuFade,
  menuItemSlide,
  
  // Utilities
  createStaggerDelay,
  createRandomFloat,
  createParallax,
  createSequence,
  createParticles
};

export default AnimationPresets;