import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  Droplets, 
  FastForward, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Zap
} from 'lucide-react';

const FloatingIcon = ({ icon: Icon, delay, x, y, size = 24 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [0, -20, 0],
      x: [0, 10, 0]
    }}
    transition={{ 
      duration: 5 + Math.random() * 5,
      repeat: Infinity,
      delay: delay
    }}
    className="absolute text-[#0d7377]/20 pointer-events-none"
    style={{ left: x, top: y }}
  >
    <Icon size={size} />
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, color, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl hover:border-[#0d7377]/30 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${color.replace('from-', 'bg-').split(' ')[0]}/10 text-[#0d7377]`}>
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#0d7377] transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
      <div className="mt-6 flex items-center text-[#0d7377] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more <ChevronRight size={16} />
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const scaleSpring = useSpring(1, { stiffness: 300, damping: 30 });

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-[#FDFCF9] selection:bg-[#0d7377]/10 selection:text-[#0d7377] overflow-x-hidden">
      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingIcon icon={Sparkles} x="10%" y="20%" delay={0} size={32} />
        <FloatingIcon icon={Zap} x="85%" y="15%" delay={1} size={40} />
        <FloatingIcon icon={Heart} x="75%" y="80%" delay={2} size={28} />
        <FloatingIcon icon={Droplets} x="15%" y="70%" delay={0.5} size={36} />
        
        {/* Static Gradient Orbs (Animations removed to fix scroll lag) */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#0d7377]/10 blur-[120px] rounded-full"
        />
        <div 
          className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-[#fea619]/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Header */}
      <header className="h-20 w-full fixed top-0 z-50 bg-[#FDFCF9]/60 backdrop-blur-xl border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#0d7377] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0d7377]/20 group-hover:rotate-12 transition-transform">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Food Sahaya</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {['Solution', 'Impact', 'Technology', 'Network'].map((item) => (
              <button 
                key={item} 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="hover:text-[#0d7377] transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0d7377] transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/login" className="text-slate-900 font-bold px-4 py-2 hover:text-[#0d7377] transition-colors">
              Login
            </Link>
            <Link to="/login" className="bg-slate-900 text-white rounded-full px-6 py-2.5 font-bold hover:bg-[#0d7377] transition-all shadow-xl hover:shadow-[#0d7377]/20 active:scale-95">
              Get Started
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="z-10 pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          <motion.div
            style={{ y: textY, opacity }}
            className="max-w-4xl mx-auto will-change-transform"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-[#0d7377]/10 text-[#0d7377] px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-[#0d7377]/20"
            >
              <Sparkles size={16} />
              <span>AI-Powered Food Logistics 2.0</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8"
            >
              FEED <span className="text-[#0d7377]">MORE.</span><br/>
              WASTE <span className="text-[#fea619]">LESS.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Connecting surplus food from restaurants to those in need in real-time. 
              Built with precision logistics and a heart for the community.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/login" className="w-full sm:w-auto bg-[#0d7377] text-white rounded-2xl px-10 py-5 text-lg font-bold shadow-2xl shadow-[#0d7377]/30 hover:-translate-y-1 hover:bg-[#00595c] transition-all flex items-center justify-center gap-2 group">
                Donate Food Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-200 rounded-2xl px-10 py-5 text-lg font-bold hover:border-[#0d7377] transition-all flex items-center justify-center gap-2 group">
                Join as NGO
                <Heart className="group-hover:scale-110 transition-transform text-red-500" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Hero Image/3D Element */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="mt-20 relative w-full max-w-5xl px-6 group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF9] via-transparent to-transparent z-10" />
            <motion.div
              whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(13,115,119,0.3)] border-4 border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" 
                alt="Food Sahaya Dashboard"
                className="w-full h-auto object-cover"
              />
              {/* Overlay Glass Stats */}
              <div className="absolute bottom-12 left-12 right-12 flex flex-wrap justify-between gap-8 z-20">
                {[
                  { label: 'Meals Delivered', value: '48.2k+', icon: Zap },
                  { label: 'Active Partners', value: '1.2k+', icon: MapPin },
                  { label: 'CO2 Saved', value: '12.5t', icon: Droplets }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.2 }}
                    className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 flex items-center gap-4 min-w-[200px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-white">
                      <stat.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest">{stat.label}</p>
                      <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="solution" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm uppercase font-black text-[#0d7377] tracking-[0.3em] mb-4">The Solution</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900">Precision Logistics for Social Impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FastForward}
              title="60-Second Dispatch"
              desc="Our algorithm matches surplus food to the nearest NGO within a minute, ensuring maximum freshness and safety."
              color="from-teal-500 to-emerald-500"
              index={0}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Expiry DNA Scoring"
              desc="Real-time food viability assessment based on storage conditions, travel time, and preparation method."
              color="from-amber-500 to-orange-500"
              index={1}
            />
            <FeatureCard 
              icon={MapPin}
              title="Zone Optimization"
              desc="Cluster-based logistics minimizes fuel costs and carbon footprint while maximizing delivery speed."
              color="from-blue-500 to-indigo-500"
              index={2}
            />
          </div>
        </section>

        {/* Scrolling Animation Section */}
        <section id="technology" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] repeat" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20 relative z-10">
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="inline-block bg-[#0d7377] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Modern Stack
                </div>
                <h2 className="text-5xl font-black leading-tight">Built for Scale and Speed.</h2>
                <p className="text-xl text-slate-400 leading-relaxed">
                  We use advanced data clustering and real-time synchronization to ensure that no meal goes to waste. Our platform handles thousands of requests simultaneously with sub-second latency.
                </p>
                
                <ul className="space-y-6">
                  {[
                    { title: 'Real-time WebSockets', desc: 'Instant notifications for donors and volunteers.' },
                    { title: 'Cloud Integration', desc: 'Secure data handling with automated backups.' },
                    { title: 'Mobile First', desc: 'Seamless experience on any device, anywhere.' }
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="mt-1 w-6 h-6 rounded-full bg-[#0d7377] flex items-center justify-center shrink-0">
                        <ArrowRight size={14} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-br from-[#0d7377] to-blue-600 p-1 rounded-[3rem] shadow-[0_0_50px_rgba(13,115,119,0.3)]">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                    alt="Analytics"
                    className="rounded-[2.8rem] w-full"
                  />
                </div>
                
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl text-slate-900 hidden md:block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Zap size={16} />
                    </div>
                    <span className="font-bold">System Status</span>
                  </div>
                  <div className="text-2xl font-black text-[#0d7377]">99.9% Uptime</div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-[#fea619] p-6 rounded-3xl shadow-2xl text-slate-900 hidden md:block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="text-[#684000]" size={20} />
                    <span className="font-bold text-[#684000]">Active Users</span>
                  </div>
                  <div className="text-2xl font-black text-white">4,281 Live</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0d7377] to-[#00595c] rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-[#0d7377]/40">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10 pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">Ready to Make an Impact?</h2>
              <p className="text-xl text-teal-100/80 mb-12 max-w-2xl mx-auto">
                Join the network of 1,000+ businesses and NGOs working together to end food waste in Bangalore.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/login" className="bg-white text-[#0d7377] px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl">
                  Start Donating
                </Link>
                <Link to="/login" className="bg-transparent border-2 border-white/30 hover:border-white text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all">
                  Partner with Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">Food Sahaya</span>
          </div>
          
          <div className="flex gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          
          <p className="text-sm text-slate-400">© 2026 Food Sahaya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
