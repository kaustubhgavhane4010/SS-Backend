/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CAMPUS ASSIST — The Intelligence Layer for UK Higher Education
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * DESIGN TOKENS (derived from existing brand blue gradient + elevated palette):
 * ┌────────────────────┬───────────┬────────────────────────────────────────────┐
 * │ Token              │ Hex       │ Usage                                      │
 * ├────────────────────┼───────────┼────────────────────────────────────────────┤
 * │ Navy Deep          │ #0A1628   │ Hero background base, footer               │
 * │ Oxford Blue        │ #0F2847   │ Section backgrounds, depth                 │
 * │ Primary 900        │ #1e3a8a   │ Text headings on light, trust badges       │
 * │ Primary 800        │ #1e40af   │ Gradient midpoint                          │
 * │ Primary 600        │ #2563eb   │ CTAs, links, interactive                   │
 * │ Primary 500        │ #3b82f6   │ Brand primary, accents                     │
 * │ Primary 400        │ #60a5fa   │ Highlights, active states                  │
 * │ Primary 200        │ #bfdbfe   │ Light fills, tag backgrounds               │
 * │ Primary 100        │ #dbeafe   │ Section alternates                         │
 * │ Accent Gold        │ #facc15   │ ROI highlight, badges, urgency accents     │
 * │ Accent Gold Dark   │ #eab308   │ Hover states for gold                      │
 * │ Success Green      │ #22c55e   │ Positive metrics, savings                  │
 * │ Danger Red         │ #ef4444   │ Loss metrics, risk indicators              │
 * │ Surface            │ #f8fafc   │ Page background                            │
 * │ Surface Card       │ #ffffff   │ Card backgrounds                           │
 * │ Text Primary       │ #0f172a   │ Body text                                  │
 * │ Text Secondary     │ #475569   │ Supporting text                            │
 * │ Text Muted         │ #94a3b8   │ Captions, labels                           │
 * └────────────────────┴───────────┴────────────────────────────────────────────┘
 *
 * TYPOGRAPHY SCALE:
 *   Display:  72px / 80px (Hero headline)
 *   H1:       48px / 56px (Section titles)
 *   H2:       36px / 44px (Sub-sections)
 *   H3:       24px / 32px (Card titles)
 *   Body LG:  20px / 32px (Hero sub-headline)
 *   Body:     16px / 28px (Paragraphs)
 *   Caption:  14px / 20px (Labels, badges)
 *   Micro:    12px / 16px (Fine print)
 *
 * FONT: Inter (already loaded in index.css)
 *
 * ABSTRACT AI BACKGROUND NOTES:
 * - Hero: Dark navy base (#0A1628) with subtle radial gradient orbs in
 *   primary-600/10 and primary-400/5. Overlaid with a fine dot-grid pattern
 *   (1px dots every 24px at 4% opacity) to evoke "data intelligence."
 *   Animated floating gradient meshes using Framer Motion create an organic,
 *   breathing AI feel. A subtle neural-network-style SVG with connected nodes
 *   and thin lines at 3% opacity sits behind the text.
 * - Product Section: Light (#f8fafc) with a barely-visible topographic
 *   contour pattern in primary-100/30 suggesting layered data analysis.
 * - Calculator Section: White cards on a soft primary-50 background with
 *   subtle animated counter transitions.
 * - Trust Section: Oxford Blue (#0F2847) with glass cards and constellation
 *   dot pattern evoking precision and security.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Shield,
  MessageSquare,
  BarChart3,
  Send,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Globe,
  Lock,
  Zap,
  Users,
  Clock,
  Smartphone,
  Bell,
  FileCheck,
  BadgeCheck,
  Sparkles,
  Activity,
  PoundSterling,
  Building2,
  Timer,
  CircleDot,
  Layers,
  Eye,
  Heart,
  Target,
  Gauge,
  ShieldCheck,
  CloudCog,
  Scale,
  BookOpen,
  Landmark,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const DESIGN_TOKENS = {
  colors: {
    navyDeep: '#0A1628',
    oxfordBlue: '#0F2847',
    primary900: '#1e3a8a',
    primary800: '#1e40af',
    primary600: '#2563eb',
    primary500: '#3b82f6',
    primary400: '#60a5fa',
    primary200: '#bfdbfe',
    primary100: '#dbeafe',
    primary50: '#eff6ff',
    accentGold: '#facc15',
    accentGoldDark: '#eab308',
    successGreen: '#22c55e',
    dangerRed: '#ef4444',
    surface: '#f8fafc',
    surfaceCard: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════════ */

const EASE_CURVE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: EASE_CURVE },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: EASE_CURVE },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   REUSABLE MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

/** Animated counter for financial figures */
const AnimatedCounter: React.FC<{
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}> = ({ target, prefix = '', suffix = '', duration = 2000, className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

/** Section wrapper with scroll-triggered animations */
const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', id, style }) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
};

/** Abstract dot-grid background SVG pattern */
const DotGridPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`absolute inset-0 w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dot-grid)" />
  </svg>
);

/** Neural network constellation SVG overlay */
const NeuralNetworkBg: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.03]"
    viewBox="0 0 1200 800"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Neural network nodes and connections */}
    {[
      { x: 100, y: 200 }, { x: 250, y: 100 }, { x: 400, y: 300 },
      { x: 550, y: 150 }, { x: 700, y: 400 }, { x: 850, y: 200 },
      { x: 1000, y: 350 }, { x: 150, y: 500 }, { x: 350, y: 600 },
      { x: 600, y: 550 }, { x: 800, y: 650 }, { x: 1050, y: 500 },
      { x: 200, y: 700 }, { x: 500, y: 700 }, { x: 900, y: 100 },
      { x: 1100, y: 700 },
    ].map((node, i, arr) => (
      <g key={i}>
        <circle cx={node.x} cy={node.y} r="4" fill="white" />
        {arr.slice(i + 1, i + 4).map((target, j) => (
          <line
            key={j}
            x1={node.x} y1={node.y}
            x2={target.x} y2={target.y}
            stroke="white" strokeWidth="0.5" opacity="0.5"
          />
        ))}
      </g>
    ))}
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

const CampusAssistLanding: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<'domestic' | 'international'>('domestic');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  // Scroll listener for header glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 1: GLASSMORPHISM HEADER
     ───────────────────────────────────────────────────────────────────────── */
  const Header = () => (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-primary-900/5 border-b border-white/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-md'
                : 'bg-white/15 backdrop-blur-md border border-white/20'
            }`}>
              <Brain className={`h-5 w-5 ${scrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <div>
              <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-neutral-900' : 'text-white'
              }`}>
                Campus Assist
              </span>
              <span className={`hidden sm:block text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                scrolled ? 'text-primary-600' : 'text-primary-300'
              }`}>
                Intelligence Layer
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Platform', id: 'platform' },
              { label: 'ROI', id: 'roi-calculator' },
              { label: 'Procurement', id: 'procurement' },
              { label: 'Trust & Security', id: 'trust' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className={`hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scrolled
                  ? 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => scrollToSection('cta')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105 transition-all duration-200"
            >
              Request Demo
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-neutral-700 hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200/50"
          >
            <div className="px-4 py-4 space-y-1">
              {[
                { label: 'Platform', id: 'platform' },
                { label: 'ROI Calculator', id: 'roi-calculator' },
                { label: 'Procurement', id: 'procurement' },
                { label: 'Trust & Security', id: 'trust' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium text-sm transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold text-sm"
              >
                Sign In →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 2: HERO
     Background: Navy Deep (#0A1628) with animated gradient orbs, dot-grid
     pattern at 4% opacity, and neural-network SVG constellation overlay.
     ───────────────────────────────────────────────────────────────────────── */
  const Hero = () => (
    <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: DESIGN_TOKENS.colors.navyDeep }}>
      {/* Abstract AI background layers */}
      <div className="absolute inset-0">
        {/* Gradient orb 1 - top right */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
        />
        {/* Gradient orb 2 - bottom left */}
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)' }}
        />
        {/* Gradient orb 3 - center */}
        <motion.div
          animate={{ x: [0, 15, -15, 0], y: [0, -25, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }}
        />
        {/* Dot grid pattern */}
        <DotGridPattern className="text-white/[0.04]" />
        {/* Neural network constellation */}
        <NeuralNetworkBg />
      </div>

      {/* Hero Content */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl">
          {/* Eyebrow badge */}
          <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            <span className="text-primary-300 text-sm font-medium">Purpose-Built for UK Higher Education</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            The Intelligence Layer
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-blue-200 bg-clip-text text-transparent">
              for UK Higher Education
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p variants={fadeInUp} custom={2} className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mb-10">
            UK universities lose <span className="text-white font-semibold">£28,000 for every student dropout</span>.
            Campus Assist uses AI-driven sentiment analysis to identify at-risk students before
            they disengage—sitting as a lightweight layer on top of your existing Student Information System.
          </motion.p>

          {/* CTA Group */}
          <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16">
            <button
              onClick={() => scrollToSection('cta')}
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
            >
              Request a Demo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('roi-calculator')}
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl text-white/90 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              <PoundSterling className="h-5 w-5 text-accent-400" />
              Calculate Your ROI
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-white/40" />
            </button>
          </motion.div>

          {/* Hero Stats Row */}
          <motion.div variants={fadeInUp} custom={4} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            {[
              { value: '£28,000', label: 'Average cost per dropout', icon: TrendingDown, color: 'text-red-400' },
              { value: '40%', label: 'Of UK institutions in deficit', icon: AlertTriangle, color: 'text-amber-400' },
              { value: '24/7', label: 'AI-powered student support', icon: Clock, color: 'text-primary-400' },
            ].map((stat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-white/20" />
        </motion.div>
      </motion.div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 3: SOCIAL PROOF BAR
     ───────────────────────────────────────────────────────────────────────── */
  const SocialProofBar = () => (
    <Section className="py-12 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p variants={fadeIn} className="text-center text-sm font-medium text-neutral-400 uppercase tracking-[0.15em] mb-8">
          Designed for institutions using
        </motion.p>
        <motion.div variants={fadeIn} custom={1} className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {['Ellucian Banner', 'Tribal SITS', 'Unit-e', 'UCAS', 'Microsoft 365'].map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
              <Layers className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 4: FINANCIAL HEMORRHAGE — ATTRITION CALCULATOR
     Background: Soft primary-50 with white calculator cards. Animated
     counters illustrate the cost contrast.
     ───────────────────────────────────────────────────────────────────────── */
  const AttritionCalculator = () => {
    const domesticLoss = 28000;
    const internationalLoss = 42000; // Significantly higher as per brief
    const licenseCost = 25000;
    const tuitionFee = 9535;
    const activeLoss = activeCalculatorTab === 'domestic' ? domesticLoss : internationalLoss;
    const studentsSlider = [1, 5, 10, 25, 50];
    const [savedStudents, setSavedStudents] = useState(1);

    return (
      <Section id="roi-calculator" className="py-24 lg:py-32 bg-gradient-to-b from-white to-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200/50 mb-6">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm font-semibold">The Financial Reality</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
              Every Dropout Costs More Than
              <br />
              <span className="text-red-500">Our Entire Annual Licence</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
              The "One Student" ROI Guarantee: if Campus Assist prevents just one student from leaving,
              the annual licence pays for itself. Everything beyond that is net savings.
            </motion.p>
          </div>

          {/* Calculator Card */}
          <motion.div variants={scaleIn} custom={1} className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl shadow-neutral-900/5 border border-neutral-200/50 overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex border-b border-neutral-100">
                {(['domestic', 'international'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCalculatorTab(tab)}
                    className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      activeCalculatorTab === tab
                        ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {tab === 'domestic' ? '🇬🇧 Domestic Student' : '🌍 International Student'}
                  </button>
                ))}
              </div>

              <div className="p-8 lg:p-12">
                {/* Cost Comparison Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {/* License Cost */}
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Annual Licence</span>
                    </div>
                    <div className="text-4xl font-extrabold text-primary-900">
                      <AnimatedCounter target={licenseCost} prefix="£" />
                    </div>
                    <p className="text-sm text-primary-600/70 mt-2">Full platform access for your institution</p>
                  </div>

                  {/* VS Divider */}
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                      <span className="text-neutral-400 text-sm font-bold">vs</span>
                    </div>
                  </div>

                  {/* Dropout Cost */}
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">Cost per Dropout</span>
                    </div>
                    <div className="text-4xl font-extrabold text-red-600">
                      <AnimatedCounter target={activeLoss} prefix="£" />
                    </div>
                    <p className="text-sm text-red-500/70 mt-2">
                      {activeCalculatorTab === 'domestic'
                        ? `£${tuitionFee.toLocaleString()} tuition + total institutional loss`
                        : 'Significantly higher due to international fee levels'}
                    </p>
                  </div>
                </div>

                {/* Savings Simulator */}
                <div className="bg-neutral-50 rounded-2xl p-6 lg:p-8">
                  <h3 className="text-lg font-bold text-neutral-900 mb-6">
                    Savings Simulator — How many students could you retain?
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {studentsSlider.map((n) => (
                      <button
                        key={n}
                        onClick={() => setSavedStudents(n)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          savedStudents === n
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300 hover:text-primary-700'
                        }`}
                      >
                        {n} {n === 1 ? 'student' : 'students'}
                      </button>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <p className="text-sm text-neutral-500 mb-1">Potential Losses Prevented</p>
                      <p className="text-3xl font-extrabold text-red-600">
                        £{(savedStudents * activeLoss).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4">
                      <p className="text-sm text-neutral-500 mb-1">Licence Investment</p>
                      <p className="text-3xl font-extrabold text-primary-700">
                        £{licenseCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200/50">
                      <p className="text-sm text-green-700 font-semibold mb-1">Net Savings</p>
                      <p className="text-3xl font-extrabold text-green-600">
                        £{((savedStudents * activeLoss) - licenseCost).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ROI Percentage */}
                  <div className="mt-6 text-center">
                    <motion.div
                      key={savedStudents}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg"
                    >
                      <TrendingUp className="h-5 w-5" />
                      {Math.round(((savedStudents * activeLoss) / licenseCost) * 100)}% Return on Investment
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 5: THREE-PILLAR PRODUCT ECOSYSTEM
     Background: Surface (#f8fafc) with barely-visible topographic contour
     pattern in primary-100/30 suggesting layered data analysis.
     ───────────────────────────────────────────────────────────────────────── */
  const ProductEcosystem = () => (
    <Section id="platform" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      {/* Topographic contour background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {[100, 200, 300, 400, 500].map((r, i) => (
            <ellipse key={i} cx="600" cy="400" rx={r * 1.5} ry={r} fill="none" stroke="#3b82f6" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200/50 mb-6">
            <Layers className="h-4 w-4 text-primary-600" />
            <span className="text-primary-700 text-sm font-semibold">The Platform</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
            Three Pillars of
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Student Success</span>
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
            A unified intelligence layer that connects your student-facing support with
            staff-facing analytics and automated intervention—all from one platform.
          </motion.p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PILLAR 1: Digital Front Desk — STUDENT-FACING */}
          <motion.div variants={fadeInUp} custom={0} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 hover:-translate-y-1">
              {/* Student Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">Student-Facing</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">The Digital Front Desk</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                A mobile-first AI chat interface providing 24/7 autonomous support for every student query—
                from accommodation to academic appeals—without waiting in phone queues.
              </p>

              {/* Mock Chat Interface */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-600">Campus Assist AI</span>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-green-600 font-medium">Online</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-2.5 shadow-sm text-xs text-neutral-600 max-w-[85%]">
                    Hi! I need help with my extenuating circumstances form. The deadline is tomorrow.
                  </div>
                  <div className="bg-primary-500 rounded-lg p-2.5 shadow-sm text-xs text-white max-w-[85%] ml-auto">
                    I can help with that right away. I'll walk you through the EC form and notify your tutor. Let me pull up the requirements...
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['24/7 Available', 'Multi-language', 'Mobile-First'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-primary-50 text-primary-700 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* PILLAR 2: Retention & Risk Engine — STAFF-FACING */}
          <motion.div variants={fadeInUp} custom={1} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500 hover:-translate-y-1">
              {/* Staff Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">Staff-Facing</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Retention & Risk Engine</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                A staff dashboard with predictive engagement scores and sentiment flags.
                Identify which students are disengaging before they submit a withdrawal form.
              </p>

              {/* Mock Dashboard Preview */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-600">Risk Overview</span>
                  <span className="text-[10px] text-neutral-400">Live</span>
                </div>
                {[
                  { name: 'Alex M.', score: 32, risk: 'High', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
                  { name: 'Priya K.', score: 58, risk: 'Medium', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                  { name: 'James L.', score: 87, risk: 'Low', color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
                ].map((student, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-500">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium text-neutral-700 w-16 truncate">{student.name}</span>
                    <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className={`h-full ${student.color} rounded-full`} style={{ width: `${student.score}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.bg} ${student.text}`}>
                      {student.risk}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Sentiment Analysis', 'Predictive Scores', 'Early Alerts'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 text-amber-700 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* PILLAR 3: Proactive Outreach — AUTOMATED */}
          <motion.div variants={fadeInUp} custom={2} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-green-400/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-green-900/5 transition-all duration-500 hover:-translate-y-1">
              {/* Automated Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full">Automated</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/25">
                <Send className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Proactive Outreach</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                Automated, personalised SMS and WhatsApp check-ins triggered when student engagement drops.
                Reach students on the channels they actually use—before it's too late.
              </p>

              {/* Mock SMS Preview */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
                  <Smartphone className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-neutral-600">Automated Check-In</span>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="flex items-start gap-2">
                    <Bell className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-800 leading-relaxed">
                        Hi Alex, we noticed you haven't attended your last 2 seminars. Is everything OK?
                        Your personal tutor Dr. Smith is available this week. Would you like us to book a
                        quick chat? Reply YES or tap here →
                      </p>
                      <p className="text-[10px] text-green-600 mt-2 font-medium">via WhatsApp • Sent automatically</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['SMS', 'WhatsApp', 'Auto-Triggered'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-green-50 text-green-700 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* How it connects */}
        <motion.div variants={fadeInUp} custom={3} className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white border border-neutral-200/70 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <CircleDot className="h-4 w-4 text-primary-500" />
              <span>Student interacts</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>AI analyses sentiment</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Send className="h-4 w-4 text-green-500" />
              <span>Outreach triggers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 6: PROCUREMENT STRATEGY
     ───────────────────────────────────────────────────────────────────────── */
  const ProcurementSection = () => (
    <Section id="procurement" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200/50 mb-6">
              <FileCheck className="h-4 w-4 text-green-600" />
              <span className="text-green-700 text-sm font-semibold">Procurement-Friendly</span>
            </motion.div>

            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight mb-6">
              From First Call to
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Go-Live in Weeks</span>
            </motion.h2>

            <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed mb-8">
              At £25,000, the Campus Assist pilot sits comfortably below the £50,000+ formal
              tender threshold used by most UK universities. This means Deans and departmental
              heads can approve via discretionary budgets—no 6-month procurement cycles.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="space-y-5">
              {[
                {
                  icon: Timer,
                  title: 'Sub-Threshold Pricing',
                  desc: 'At £25,000, approval comes from departmental discretionary budgets—not a formal tender process.',
                },
                {
                  icon: Zap,
                  title: 'Rapid Deployment',
                  desc: 'Cloud-native architecture means no on-premise installation. Go live within 2-4 weeks of sign-off.',
                },
                {
                  icon: Building2,
                  title: 'Low-Risk Pilot Model',
                  desc: 'Start with a single department or faculty. Prove ROI, then expand institution-wide with confidence.',
                },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900 mb-1">{title}</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual Card */}
          <motion.div variants={scaleIn} custom={2}>
            <div className="relative">
              {/* Background glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-green-400/10 to-primary-400/10 rounded-3xl blur-2xl" />

              <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 lg:p-10 shadow-2xl">
                {/* Procurement Badge */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Procurement-Ready</h4>
                    <p className="text-neutral-400 text-sm">Below formal tender threshold</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  {[
                    { week: 'Week 1', label: 'Discovery & Scoping', status: 'complete' },
                    { week: 'Week 2', label: 'Data Integration Setup', status: 'complete' },
                    { week: 'Week 3', label: 'Staff Training & UAT', status: 'active' },
                    { week: 'Week 4', label: 'Go-Live & Monitoring', status: 'upcoming' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.status === 'complete'
                          ? 'bg-green-500 text-white'
                          : step.status === 'active'
                          ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {step.status === 'complete' ? '✓' : i + 1}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{step.week}</p>
                        <p className={`text-sm font-semibold ${
                          step.status === 'upcoming' ? 'text-neutral-400' : 'text-white'
                        }`}>{step.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Tag */}
                <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Departmental Pilot</p>
                      <p className="text-3xl font-extrabold text-white mt-1">£25,000<span className="text-base font-normal text-neutral-500">/year</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-400 font-semibold">Below £50k threshold</p>
                      <p className="text-xs text-neutral-500">No formal tender required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 7: TRUST & FUTURE-PROOFING
     Background: Oxford Blue (#0F2847) with glass cards and constellation
     dot pattern suggesting precision and security.
     ───────────────────────────────────────────────────────────────────────── */
  const TrustSection = () => (
    <Section id="trust" className="py-24 lg:py-32 relative overflow-hidden" style={{ background: DESIGN_TOKENS.colors.oxfordBlue }}>
      {/* Constellation pattern */}
      <DotGridPattern className="text-white/[0.03]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary-300" />
            <span className="text-primary-200 text-sm font-semibold">Enterprise-Grade Trust</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Built for Regulatory
            <br />
            <span className="bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">Confidence</span>
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-lg text-white/50 leading-relaxed">
            Campus Assist is designed to meet the rigorous compliance, security, and quality standards
            that UK higher education institutions require.
          </motion.p>
        </div>

        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: 'GDPR & DPIA Ready',
              desc: 'Full GDPR compliance with completed Data Protection Impact Assessments. Student data sovereignty built in from day one.',
              badge: 'Compliance',
            },
            {
              icon: Scale,
              title: 'OfS Condition B3 Aligned',
              desc: 'Directly supports Office for Students Condition B3 metrics for student outcomes, continuation rates, and completion.',
              badge: 'Regulatory',
            },
            {
              icon: CloudCog,
              title: 'Cloud-Native Security',
              desc: 'Enterprise-grade encryption at rest and in transit. SOC 2 aligned security practices with 99.9% uptime SLA.',
              badge: 'Infrastructure',
            },
            {
              icon: Globe,
              title: 'SIS-Agnostic Integration',
              desc: 'Seamlessly integrates with Ellucian Banner, Tribal SITS, and other major Student Information Systems via secure APIs.',
              badge: 'Integration',
            },
            {
              icon: BookOpen,
              title: 'Transparent AI',
              desc: 'Explainable AI models with no black-box decisions. Staff can see exactly why a student was flagged and what evidence was used.',
              badge: 'Ethics',
            },
            {
              icon: Landmark,
              title: 'Sector Expertise',
              desc: 'Purpose-built for UK HE by a team that understands TEF, KEF, and the unique challenges of post-92 and Russell Group institutions alike.',
              badge: 'Expertise',
            },
          ].map(({ icon: Icon, title, desc, badge }, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-300" />
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-300/70 bg-primary-400/10 rounded-full">
                  {badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 8: FINAL CTA
     ───────────────────────────────────────────────────────────────────────── */
  const FinalCTA = () => (
    <Section id="cta" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/25 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
          One Student Saved Pays
          <br />
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">for the Entire Year</span>
        </motion.h2>

        <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          Join the next generation of UK universities using AI-driven intelligence to improve
          student outcomes, reduce attrition, and demonstrate real impact to the OfS.
          Your pilot starts at £25,000—below the formal tender threshold.
        </motion.p>

        <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@campusassist.co.uk?subject=Demo%20Request%20-%20Campus%20Assist"
            className="group inline-flex items-center gap-3 px-10 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
          >
            Request Your Demo
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <button
            onClick={() => scrollToSection('roi-calculator')}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl text-primary-700 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
          >
            <PoundSterling className="h-5 w-5" />
            See ROI Calculator
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fadeIn} custom={4} className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Lock, label: 'GDPR Ready' },
            { icon: ShieldCheck, label: 'DPIA Complete' },
            { icon: Scale, label: 'OfS B3 Aligned' },
            { icon: CloudCog, label: 'Cloud-Native' },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2 text-neutral-400">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 9: FOOTER
     ───────────────────────────────────────────────────────────────────────── */
  const Footer = () => (
    <footer className="py-16 relative overflow-hidden" style={{ background: DESIGN_TOKENS.colors.navyDeep }}>
      <DotGridPattern className="text-white/[0.02]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Campus Assist</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-primary-400 font-medium">Intelligence Layer</span>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-md">
              The AI-powered intelligence layer for UK higher education. Reducing attrition,
              improving student outcomes, and delivering measurable ROI for university leadership.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              {['Digital Front Desk', 'Retention Engine', 'Proactive Outreach', 'Analytics Dashboard'].map((item) => (
                <li key={item}>
                  <button onClick={() => scrollToSection('platform')} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              {['ROI Calculator', 'Procurement Guide', 'Security Overview', 'Contact Us'].map((item, i) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(['roi-calculator', 'procurement', 'trust', 'cta'][i])}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Campus Assist — KG Innovate Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/30 hover:text-white/50 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-white/30 hover:text-white/50 cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs text-white/30 hover:text-white/50 cursor-pointer transition-colors">GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="antialiased">
      <Header />
      <Hero />
      <SocialProofBar />
      <AttritionCalculator />
      <ProductEcosystem />
      <ProcurementSection />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default CampusAssistLanding;
