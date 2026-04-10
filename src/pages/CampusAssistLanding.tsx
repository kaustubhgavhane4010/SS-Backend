/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CAMPUS ASSIST — The Unified AI Student Success & Support Platform
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
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  Users,
  Clock,
  GraduationCap,
  FileCheck,
  BadgeCheck,
  Sparkles,
  Activity,
  Building2,
  Timer,
  CircleDot,
  Layers,
  Heart,
  ShieldCheck,
  CloudCog,
  Scale,
  BookOpen,
  Landmark,
  Globe,
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
  const [activeHeroTab, setActiveHeroTab] = useState<'student' | 'staff'>('student');
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
                AI Success Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Platform', id: 'platform' },
              { label: 'Impact', id: 'impact-simulator' },
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
              Book Demo
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
                { label: 'Impact Simulator', id: 'impact-simulator' },
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
     SECTION 2: HERO — "The Convergence"
     Split-View: Student AI Chat (left) | Staff Risk Dashboard (right)
     Background: Navy Deep with animated gradient orbs + neural constellation.
     NO mention of £28,000 specific figure. Focus on dual-value proposition.
     ───────────────────────────────────────────────────────────────────────── */
  const Hero = () => (
    <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: DESIGN_TOKENS.colors.navyDeep }}>
      {/* Abstract AI background layers */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, 15, -15, 0], y: [0, -25, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }}
        />
        <DotGridPattern className="text-white/[0.04]" />
        <NeuralNetworkBg />
      </div>

      {/* Hero Content — Two-Column: Copy + Split-View */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <motion.div variants={fadeInUp} custom={0} className="mb-6 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3">
          <p className="text-sm text-amber-100">
            <span className="font-semibold">Under OFS enhanced monitoring?</span> Campus Assist helps demonstrate proactive student-retention intervention.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 backdrop-blur-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-300 text-sm font-medium">UK Higher Education Retention Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Catch At-Risk Students
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-blue-200 bg-clip-text text-transparent">
                4-6 Weeks Before They Withdraw
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} custom={2} className="text-lg text-white/60 leading-relaxed max-w-xl mb-10">
              Campus Assist is the UK's GDPR-compliant AI layer that predicts withdrawal early,
              without replacing legacy or traditional systems.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <button
                onClick={() => scrollToSection('cta')}
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
              >
                Book a 30-Minute Demo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('impact-simulator')}
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl text-white/90 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                Calculate Your Attrition Cost
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-white/40" />
              </button>
            </motion.div>

            {/* Compact trust badges */}
            <motion.div variants={fadeIn} custom={4} className="flex flex-wrap items-center gap-4">
              {[
                { icon: Lock, label: 'UK GDPR Article 9 compliant' },
                { icon: Layers, label: 'Integrates with legacy and traditional systems' },
                { icon: Timer, label: 'Go live in under 3 weeks' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/30">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
            <motion.p variants={fadeIn} custom={5} className="mt-4 text-xs text-white/40">
              Built from 2 years of discovery research across 8 UK institutions.
            </motion.p>
          </div>

          {/* Right: Split-View Interface Mockup */}
          <motion.div variants={scaleIn} custom={2} className="hidden lg:block">
            <div className="relative">
              {/* Ambient glow behind the mockup */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary-500/15 to-primary-400/5 rounded-3xl blur-3xl" />

              {/* Tab Switcher */}
              <div className="relative">
                <div className="flex mb-4 bg-white/5 rounded-xl p-1 backdrop-blur-sm border border-white/10">
                  {([
                    { key: 'student' as const, label: 'Student View', icon: MessageSquare },
                    { key: 'staff' as const, label: 'Staff View', icon: BarChart3 },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveHeroTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeHeroTab === key
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeHeroTab === 'student' ? (
                    /* ── STUDENT-FACING: Mobile AI Chat ── */
                    <motion.div
                      key="student"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 rounded-full">Student-Facing</span>
                        <span className="text-[9px] text-white/30">•</span>
                        <span className="text-[9px] text-white/30">40+ Languages</span>
                      </div>

                      {/* Chat header */}
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white">Campus Assist AI</span>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-[10px] text-green-400">Always Online</span>
                          </div>
                        </div>
                      </div>

                      {/* Chat messages */}
                      <div className="space-y-3 mb-4">
                        <div className="bg-white/10 rounded-xl p-3 max-w-[85%]">
                          <p className="text-[11px] text-white/80 leading-relaxed">Hi, I'm really struggling with my coursework deadline. I don't know who to talk to and I've missed my last seminar 😞</p>
                        </div>
                        <div className="bg-primary-500/30 rounded-xl p-3 max-w-[85%] ml-auto">
                          <p className="text-[11px] text-white leading-relaxed">I'm sorry to hear that. Let me help right away. I can:<br/>
                          ✅ Guide you through an EC form<br/>
                          ✅ Connect you with your personal tutor<br/>
                          ✅ Book a wellbeing appointment<br/>
                          Which would be most helpful?</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 max-w-[60%]">
                          <p className="text-[11px] text-white/80">The wellbeing appointment please 🙏</p>
                        </div>
                      </div>

                      {/* Typing indicator */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                        </div>
                        <span className="text-[10px] text-white/30">Booking appointment with Student Wellbeing...</span>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── STAFF-FACING: Risk Alert Dashboard ── */
                    <motion.div
                      key="staff"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full">Staff-Facing</span>
                          <span className="text-[9px] text-white/30">Risk Alert Dashboard</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          <span className="text-[10px] text-red-300 font-medium">3 Alerts</span>
                        </div>
                      </div>

                      {/* Student risk rows */}
                      <div className="space-y-2 mb-4">
                        {[
                          { name: 'Alex M.', dept: 'Business', score: 28, risk: 'Critical', color: 'bg-red-500', textColor: 'text-red-300', bgColor: 'bg-red-500/20', sentiment: '↓ Distress detected' },
                          { name: 'Priya K.', dept: 'Psychology', score: 45, risk: 'High', color: 'bg-amber-500', textColor: 'text-amber-300', bgColor: 'bg-amber-500/20', sentiment: '↓ Disengaging' },
                          { name: 'James L.', dept: 'Computing', score: 62, risk: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-300', bgColor: 'bg-yellow-500/20', sentiment: '→ Attendance drop' },
                          { name: 'Sarah W.', dept: 'Nursing', score: 91, risk: 'Low', color: 'bg-green-500', textColor: 'text-green-300', bgColor: 'bg-green-500/20', sentiment: '↑ Engaged' },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/60">
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-white truncate">{s.name}</span>
                                <span className="text-[9px] text-white/30">{s.dept}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }} />
                                </div>
                                <span className="text-[9px] text-white/40 w-6 text-right">{s.score}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.bgColor} ${s.textColor}`}>{s.risk}</span>
                              <p className={`text-[8px] mt-0.5 ${s.textColor}`}>{s.sentiment}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom insight bar */}
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <Activity className="h-3.5 w-3.5 text-primary-300 flex-shrink-0" />
                        <p className="text-[10px] text-primary-200">
                          <span className="font-semibold">Proprietary Sentiment Analysis</span> flagged 2 students from passive engagement data this week
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
          Trusted impact benchmarks for UK institutions
        </motion.p>
        <motion.div variants={fadeIn} custom={1} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { value: '60%+', label: 'Support queries resolved by AI' },
            { value: '4-6 wks', label: 'Earlier than traditional withdrawal indicators' },
            { value: '£28,000', label: 'Revenue protected per student retained' },
            { value: '< 3 weeks', label: 'From contract signing to go-live' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-center">
              <p className="text-2xl font-extrabold text-primary-700">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 4: EFFICIENCY & LOGIC — BENTO GRID
     Three high-impact metrics in a modern bento layout. No specific
     dropout figures. Focuses on operational efficiency & revenue protection.
     ───────────────────────────────────────────────────────────────────────── */
  const BentoGrid = () => (
    <Section id="results" className="py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 border border-primary-200/50 mb-6">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="text-primary-700 text-sm font-semibold">Efficiency & Logic</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
            The Numbers That
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Move the Needle</span>
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
            Campus Assist delivers both sides of the equation: operational efficiency through
            automated student support, and revenue protection through predictive retention intelligence
            that catches at-risk students weeks before they withdraw.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* METRIC 1: 60%+ Ticket Deflection — Large card */}
          <motion.div variants={scaleIn} custom={0} className="md:col-span-2 lg:col-span-2 group">
            <div className="relative h-full bg-white rounded-2xl border border-neutral-200/70 p-8 lg:p-10 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-50 to-transparent rounded-bl-full" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full">Admin Efficiency</span>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ticket Deflection</h3>
                    <p className="text-neutral-500 leading-relaxed max-w-lg">
                      Our AI handles routine student queries autonomously—extenuating circumstances, timetabling,
                      accommodation, finance—freeing your student services team to focus on complex welfare cases.
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <div className="text-6xl lg:text-7xl font-extrabold text-primary-600">
                      <AnimatedCounter target={60} suffix="%" />
                    </div>
                    <p className="text-sm text-primary-600/60 font-medium">of queries resolved<br/>without human input</p>
                  </div>
                </div>

                {/* Mobile: show number inline */}
                <div className="sm:hidden mb-4">
                  <span className="text-5xl font-extrabold text-primary-600">
                    <AnimatedCounter target={60} suffix="%" />
                  </span>
                  <span className="text-sm text-primary-600/60 font-medium ml-2">queries auto-resolved</span>
                </div>

                {/* Progress visualization */}
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: EASE_CURVE, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">Target: 60%+</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* METRIC 2: Revenue Protection — "One Student" ROI */}
          <motion.div variants={scaleIn} custom={1} className="group">
            <div className="relative h-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-500 overflow-hidden">
              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-green-500/10 to-transparent rounded-tl-full" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300 rounded-full">Revenue Shield</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Retention-Driven ROI</h3>
                <p className="text-white/50 leading-relaxed mb-6 text-sm">
                  Predictive engagement scores and sentiment analysis flag at-risk students weeks
                  before withdrawal. Every student retained is tuition, funding, and recruitment
                  cost preserved.
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">One Student ROI</p>
                        <p className="text-white/40 text-xs">Retain one student and the retention impact is immediate</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Early Warning System</p>
                        <p className="text-white/40 text-xs">VLE + sentiment data predicts disengagement proactively</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* METRIC 3: < 3 Weeks Implementation */}
          <motion.div variants={scaleIn} custom={2} className="group">
            <div className="relative h-full bg-white rounded-2xl border border-neutral-200/70 p-8 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-amber-600" />
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">Lightweight Overlay</span>
              </div>

              <div className="text-5xl font-extrabold text-neutral-900 mb-2">
                {'< '}3
              </div>
              <p className="text-lg font-semibold text-neutral-700 mb-3">Weeks to Go-Live</p>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Cloud-native. No on-premise installation. No infrastructure changes.
                Campus Assist layers on top of your existing systems via secure API integration.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-400" />
                <span className="text-xs text-neutral-400 font-medium">Non-invasive SIS integration</span>
              </div>
            </div>
          </motion.div>

          {/* METRIC 4: Sector Crisis Context */}
          <motion.div variants={scaleIn} custom={3} className="md:col-span-2 group">
            <div className="relative h-full bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200/30 p-8 hover:shadow-xl transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">The Sector Crisis</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    UK universities are facing a financial hemorrhage. Student attrition drains tuition revenue, HEFCE funding,
                    and recruitment investment—while 40% of institutions already operate in deficit. Early intervention isn't optional. It's survival.
                  </p>
                </div>
                <div className="flex items-center gap-8 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-red-600"><AnimatedCounter target={40} suffix="%" /></div>
                    <p className="text-xs text-neutral-500 mt-1">Institutions<br/>in deficit</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-amber-600"><AnimatedCounter target={6} suffix=".3%" /></div>
                    <p className="text-xs text-neutral-500 mt-1">Non-continuation<br/>rate (UK avg)</p>
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
     SECTION 5: ATTRITION IMPACT SIMULATOR
     Interactive calculator: Domestic / International tabs, student count
     selector. Shows losses, scholarship equivalents, weekly drain.
     Pure loss quantification with gated ROI report CTA.
     ───────────────────────────────────────────────────────────────────────── */
  const ImpactSimulator = () => {
    const domesticLoss = 28000;
    const internationalLoss = 42000;
    const tuitionFee = 9535;
    const activeLoss = activeCalculatorTab === 'domestic' ? domesticLoss : internationalLoss;
    const studentsSlider = [1, 5, 10, 25, 50];
    const [savedStudents, setSavedStudents] = useState(5);

    return (
      <Section id="impact-simulator" className="py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200/50 mb-6">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm font-semibold">The £1.3 Billion Crisis</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
              Every Dropout Costs Your Institution
              <br />
              <span className="text-red-500">£28,000. Are You Counting?</span>
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
              UK universities lost an estimated £1.3 billion in tuition revenue to student attrition last year.
              Under OFS Condition B3, missing continuation thresholds can trigger public naming and penalties.
              Campus Assist helps you intervene before a student decides to leave.
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
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Is your institution under OFS monitoring pressure?
                  </p>
                  <p className="mt-1 text-sm text-amber-700/90">
                    Enter your student numbers to quantify annual attrition exposure and see what recovering even 10 students means for your budget.
                  </p>
                </div>
                {/* Cost Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {/* Dropout Cost Card */}
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">Total Cost Per Dropout</span>
                    </div>
                    <div className="text-5xl font-extrabold text-red-600 mb-2">
                      <AnimatedCounter target={activeLoss} prefix="£" />
                    </div>
                    <p className="text-sm text-red-500/70 mb-4">
                      {activeCalculatorTab === 'domestic'
                        ? `£${tuitionFee.toLocaleString()} tuition + HEFCE funding, support costs & reputational impact`
                        : 'International fee income, accommodation revenue & recruitment cost write-off'}
                    </p>
                    <div className="flex items-center gap-2 pt-4 border-t border-red-200/50">
                      <Activity className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-600 font-medium">
                        {activeCalculatorTab === 'domestic'
                          ? 'Based on HESA sector-average data for UK undergraduates'
                          : 'Estimated at 1.5× domestic rate due to higher fee bands'}
                      </span>
                    </div>
                  </div>

                  {/* Sector Context Card */}
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Sector Context</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-extrabold text-amber-700">40%</div>
                        <p className="text-sm text-amber-600/70">of UK universities currently operate in deficit</p>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-amber-700">6.3%</div>
                        <p className="text-sm text-amber-600/70">average non-continuation rate across UK HE</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-amber-200/50">
                      <BookOpen className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">Source: OFS & HESA published data 2023-24</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator */}
                <div className="bg-neutral-50 rounded-2xl p-6 lg:p-8">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Impact Simulator</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    Select the number of at-risk students you could retain with early intervention to see the potential financial impact.
                  </p>
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

                  {/* Three insight cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {/* Card 1: Annual Revenue Lost */}
                    <div className="text-center p-6 bg-white rounded-2xl border border-red-200/50 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="text-sm text-neutral-500 mb-2">Annual Revenue Lost</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-red-600">
                        £{(savedStudents * activeLoss).toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {savedStudents} {savedStudents === 1 ? 'student' : 'students'} × £{activeLoss.toLocaleString()} each
                      </p>
                    </div>

                    {/* Card 2: Scholarship Equivalent */}
                    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                        <GraduationCap className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-sm text-amber-700 font-semibold mb-2">That's Equivalent To</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-amber-700">
                        {Math.max(1, Math.round((savedStudents * activeLoss) / tuitionFee))}
                      </p>
                      <p className="text-xs text-amber-600/70 mt-2">
                        full student scholarships your institution could have funded instead
                      </p>
                    </div>

                    {/* Card 3: Weekly Cost of Inaction */}
                    <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-200/50 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-5 w-5 text-primary-600" />
                      </div>
                      <p className="text-sm text-primary-700 font-semibold mb-2">Every Week You Wait</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-primary-700">
                        £{Math.round((savedStudents * activeLoss) / 52).toLocaleString()}
                      </p>
                      <p className="text-xs text-primary-600/60 mt-2">
                        drains while at-risk students go unsupported
                      </p>
                    </div>
                  </div>

                  {/* Gated CTA */}
                  <motion.div
                    key={savedStudents}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50">
                      <p className="text-sm text-primary-800 font-semibold">
                        Your institution could be losing <span className="text-red-600 font-extrabold">£{(savedStudents * activeLoss).toLocaleString()}</span> annually to preventable attrition
                      </p>
                      <a
                        href="mailto:hello@campusassist.co.uk?subject=Custom%20ROI%20Report%20Request%20-%20Campus%20Assist"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300 text-sm"
                      >
                        Show Me the Revenue at Risk
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <p className="text-xs text-primary-600/60">
                        We'll model your specific student population, dropout rates, and potential savings
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────
    SECTION 6: THREE-PILLAR PRODUCT ECOSYSTEM
    Pillars: Digital Front Desk | Early Warning Dashboard | UK GDPR by Design
     Uses "Proprietary Sentiment Analysis" and "Passive Engagement Data" language.
     ───────────────────────────────────────────────────────────────────────── */
  const ProductEcosystem = () => (
    <Section id="platform" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      {/* Topographic contour background */}
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
            <span className="text-primary-700 text-sm font-semibold">Two Products. One Platform.</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
            For Students: Instant Answers.
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">For Staff: Early Warnings.</span>
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
            Campus Assist combines always-on student support, early withdrawal prediction, and UK-first compliance
            so teams can act earlier without replacing existing systems.
          </motion.p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PILLAR 1: The Digital Front Desk — STUDENT-FACING */}
          <motion.div variants={fadeInUp} custom={0} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">Student-Facing</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">The Digital Front Desk</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                24/7 AI support that resolves timetable queries, deadline extensions, and payment questions instantly,
                so students get help at 2am and your team focuses on complex cases.
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
                {['Resolves 60%+ tier-1 queries', 'Mobile-first, always on', 'Trained on UK HE interactions'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-primary-50 text-primary-700 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* PILLAR 2: Early Warning Dashboard — STAFF-FACING */}
          <motion.div variants={fadeInUp} custom={1} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-rose-400/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-rose-900/5 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded-full">Safeguarding</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/25">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Early Warning Dashboard</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                Identify students at risk of withdrawal 4-6 weeks before missed deadlines and failed modules,
                with multi-signal risk scores and auditable intervention logs for OFS reporting.
              </p>

              {/* Annotated dashboard mockup */}
              <div className="relative bg-neutral-900 rounded-xl p-4 border border-neutral-700 overflow-hidden">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-700">
                  <BarChart3 className="h-3.5 w-3.5 text-rose-300" />
                  <span className="text-xs font-semibold text-neutral-200">Risk Dashboard</span>
                  <div className="ml-auto">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/25 text-red-200">LIVE ALERTS</span>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {[
                    { name: 'Alex M.', risk: 'Critical', score: 22, color: 'bg-red-500' },
                    { name: 'Priya K.', risk: 'High', score: 41, color: 'bg-amber-500' },
                    { name: 'James L.', risk: 'Medium', score: 60, color: 'bg-yellow-500' },
                  ].map((student) => (
                    <div key={student.name} className="flex items-center gap-2 rounded-lg bg-neutral-800 px-2 py-2">
                      <span className="text-[10px] text-neutral-200 w-16 truncate">{student.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                        <div className={`h-full ${student.color}`} style={{ width: `${student.score}%` }} />
                      </div>
                      <span className="text-[9px] text-neutral-300">{student.risk}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-14 right-2 rounded-md bg-white px-2 py-1 shadow-lg text-[9px] font-semibold text-neutral-700">
                  Risk score updates in real time
                </div>
                <div className="absolute bottom-16 left-2 rounded-md bg-white px-2 py-1 shadow-lg text-[9px] font-semibold text-neutral-700">
                  1-click alert to wellbeing team
                </div>
                <div className="absolute bottom-2 right-2 rounded-md bg-white px-2 py-1 shadow-lg text-[9px] font-semibold text-neutral-700">
                  Auditable intervention log
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Automated wellbeing alerts', 'Multi-signal risk scores', 'Auditable intervention logs'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* PILLAR 3: Retention Risk Engine — STAFF-FACING */}
          <motion.div variants={fadeInUp} custom={2} className="group relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-neutral-200/70 p-8 h-full hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">Staff-Facing</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">UK GDPR by Design</h3>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                Built for Article 9 special category data from day one, not retrofitted from a US FERPA model.
                Your deployment stays isolated, controlled, and ready for DPIA review.
              </p>

              {/* Mock Dashboard Preview */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-600">Risk Overview</span>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-neutral-400">Live</span>
                  </div>
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
                {['Differential privacy controls', 'Data stays institution-controlled', 'Full DPIA at onboarding'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 text-amber-700 rounded-full">{tag}</span>
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
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Smart triage routes</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Risk engine predicts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 7: PROCUREMENT STRATEGY
     Focus: speed, low-risk rollout, discretionary budget fit.
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
              No 18-Month IT Project.
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Go Live in 3 Weeks.</span>
            </motion.h2>

            <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed mb-8">
              Campus Assist is structured for a departmental first rollout, helping teams start without a long,
              institution-wide procurement cycle.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="space-y-5">
              {[
                {
                  icon: Timer,
                  title: 'Designed for Discretionary Budgets',
                  desc: 'Department-first rollout model aligns with how university teams approve new initiatives quickly.',
                },
                {
                  icon: Zap,
                  title: 'Rapid Deployment',
                  desc: 'Cloud-native architecture means no on-premise installation. Go live within 2-3 weeks of approval.',
                },
                {
                  icon: Building2,
                  title: 'Low-Risk Faculty Pilot',
                  desc: 'Start with a single department. Prove ROI with real retention data, then expand institution-wide with full confidence.',
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
            <motion.p variants={fadeInUp} custom={4} className="mt-6 text-sm text-neutral-500">
              Need a walkthrough first? <a href="#platform" className="font-semibold text-primary-700 hover:text-primary-800">See how it works →</a>
            </motion.p>
          </div>

          {/* Right: Visual Card */}
          <motion.div variants={scaleIn} custom={2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-green-400/10 to-primary-400/10 rounded-3xl blur-2xl" />

              <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 lg:p-10 shadow-2xl">
                {/* Procurement Badge */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Procurement-Ready</h4>
                    <p className="text-neutral-400 text-sm">Designed for fast institutional approval</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  {[
                    { week: 'Week 1', label: 'Discovery & Configuration', status: 'complete' },
                    { week: 'Week 2', label: 'Integration & Testing', status: 'complete' },
                    { week: 'Week 3', label: 'Staff Training & Soft Launch', status: 'active' },
                    { week: 'Week 4+', label: 'Live & Monitoring', status: 'upcoming' },
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

                {/* Procurement CTA */}
                <div className="mt-10 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm text-white/70 mb-3">
                      Works with your existing systems, without replacing current infrastructure
                    </p>
                    <a
                      href="mailto:hello@campusassist.co.uk?subject=Procurement%20Guide%20Request"
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Download the ROI Presentation
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <p className="text-[11px] text-white/30 mt-3">
                      Includes bespoke ROI modelling for your student population
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );

  const DiscoveryProofSection = () => (
    <Section className="py-16 bg-slate-50 border-y border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <motion.div variants={fadeInUp} className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">In Discovery With</p>
            <p className="mt-2 text-2xl font-extrabold text-neutral-900">Tier-2 UK Universities</p>
            <p className="mt-2 text-sm text-neutral-500">
              Pilot discussions underway with multiple institutions facing continuation and wellbeing pressure.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} custom={1} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: 'We need earlier signals, not end-of-term surprises when intervention is already too late.',
                role: 'Head of Student Services, Post-92 University',
              },
              {
                quote: 'If this works with our existing systems and supports OFS reporting, it removes the biggest blockers.',
                role: 'Director of Student Experience, UK HE Institution',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="text-sm text-neutral-700 leading-relaxed">"{item.quote}"</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">{item.role}</p>
              </div>
            ))}
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
              title: 'OFS Condition B3 Aligned',
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
              title: 'Works With Your Existing Systems',
              desc: 'Seamlessly integrates with major student information and learning systems via secure APIs.',
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

        {/* Competitor comparison */}
        <motion.div variants={fadeInUp} custom={7} className="mt-14">
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-sm p-6 lg:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-200/80">Comparison</p>
              <h3 className="text-2xl font-extrabold text-white mt-2">Why UK Institutions Choose Campus Assist</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-white/15 text-left">
                    <th className="py-3 pr-4 text-xs uppercase tracking-wider text-white/60">Capability</th>
                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-white">Campus Assist</th>
                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-white/70">US Platforms</th>
                    <th className="py-3 pl-4 text-xs uppercase tracking-wider text-white/70">Generic Chatbots</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { label: 'UK GDPR Article 9 readiness', a: '✓ Built in', b: '⚠ Often FERPA-led', c: '✗ Not purpose-built' },
                    { label: 'Deployment timeline', a: '✓ Under 3 weeks', b: '⚠ Multi-month', c: '✓ Fast but shallow' },
                    { label: 'Early withdrawal prediction', a: '✓ 4-6 week signals', b: '⚠ Variable', c: '✗ No predictive layer' },
                    { label: 'Works with legacy and traditional systems', a: '✓ Yes, additive', b: '⚠ Integration work needed', c: '✗ Limited integration' },
                    { label: 'Procurement-friendly adoption path', a: '✓ Department-first rollout', b: '⚠ Often institution-wide first', c: '✓ Fast to start, limited depth' },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-white/10 last:border-b-0">
                      <td className="py-3 pr-4 text-white/75">{row.label}</td>
                      <td className="py-3 px-4 text-emerald-300 font-semibold">{row.a}</td>
                      <td className="py-3 px-4 text-amber-200">{row.b}</td>
                      <td className="py-3 pl-4 text-rose-200">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SECTION 8: FINAL CTA
     Dual-sided value: lifeline for students, revenue-shield for admin.
     Reinforces sub-threshold procurement + One Student ROI.
     ───────────────────────────────────────────────────────────────────────── */
  const FinalCTA = () => (
    <Section id="cta" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/25 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight mb-6">
          A Lifeline for Students.
          <br />
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">A Revenue Shield for You.</span>
        </motion.h2>

        <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed mb-4 max-w-2xl mx-auto">
          Let us show you how many students your institution could retain and how quickly the impact becomes visible.
          No IT overhead and no rip-and-replace project.
        </motion.p>

        <motion.p variants={fadeInUp} custom={2.5} className="text-base text-neutral-400 mb-10 max-w-xl mx-auto">
          No commitment. No IT team needed for the call. We will run a live walkthrough tailored to your institution size.
        </motion.p>

        <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@campusassist.co.uk?subject=Demo%20Request%20-%20Campus%20Assist"
            className="group inline-flex items-center gap-3 px-10 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
          >
            Book a 30-Minute Demo
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="mailto:hello@campusassist.co.uk?subject=Procurement%20Guide%20Request%20-%20Campus%20Assist"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl text-primary-700 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
          >
            <FileCheck className="h-5 w-5" />
            Download the ROI Presentation
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fadeIn} custom={4} className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Lock, label: 'UK GDPR Compliant' },
            { icon: ShieldCheck, label: 'DPIA Ready' },
            { icon: Scale, label: 'OFS B3 Aligned' },
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
                <span className="block text-[10px] uppercase tracking-[0.2em] text-primary-400 font-medium">AI Success Platform</span>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-md">
              The unified AI support & retention platform for UK higher education. 24/7 student support,
              smart safeguarding triage, and predictive retention intelligence—all from one lightweight overlay.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              {['Digital Front Desk', 'Early Warning Dashboard', 'UK GDPR by Design', 'Staff Dashboard'].map((item) => (
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
              {['Impact Simulator', 'Procurement Guide', 'Security Overview', 'Contact Us'].map((item, i) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(['impact-simulator', 'procurement', 'trust', 'cta'][i])}
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

  const ComplianceSection = () => (
    <Section className="py-20 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200/60 mb-6">
            <Lock className="h-4 w-4 text-primary-600" />
            <span className="text-primary-700 text-sm font-semibold">Data Protection</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight mb-5">
            Your Student Data Never Leaves Your Institution.
          </motion.h2>
          <motion.p variants={fadeInUp} custom={2} className="text-lg text-neutral-500 leading-relaxed">
            Campus Assist runs within your university-controlled cloud environment. We process behavioural metadata,
            never personal records or academic content. No centralised storage, no third-party sharing, and every deployment is isolated.
          </motion.p>
        </div>
        <motion.div variants={fadeInUp} custom={3} className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            'UK GDPR Article 9 Compliant',
            'Cyber Essentials Ready',
            'DPIA Provided at Onboarding',
            'OFS Condition B3 Aligned',
          ].map((badge) => (
            <div key={badge} className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 text-center">
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );

  const OneStudentGuarantee = () => (
    <Section className="py-20" style={{ background: DESIGN_TOKENS.colors.navyDeep }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 lg:px-10">
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-300 mb-4">
            The One-Student ROI Argument
          </motion.p>
          <motion.h3 variants={fadeInUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Retain One Student, and the Business Case Is Clear.
          </motion.h3>
          <motion.p variants={fadeInUp} custom={2} className="text-white/70 max-w-3xl leading-relaxed mb-8">
            A single domestic student dropout can cost over £28,000 in lost three-year tuition.
            Even a small improvement in continuation can protect significant institutional revenue.
          </motion.p>
          <motion.div variants={fadeInUp} custom={3} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '£28k', label: 'Lost per dropout' },
              { value: '1', label: 'Student retained can shift outcomes' },
              { value: '4-6 wks', label: 'Earlier intervention window' },
              { value: '460%', label: 'ROI if 5 students retained' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
                <p className="text-3xl font-extrabold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-white/60">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="antialiased">
      <Header />
      <Hero />
      <ImpactSimulator />
      <ProductEcosystem />
      <SocialProofBar />
      <BentoGrid />
      <DiscoveryProofSection />
      <ProcurementSection />
      <ComplianceSection />
      <TrustSection />
      <OneStudentGuarantee />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default CampusAssistLanding;
