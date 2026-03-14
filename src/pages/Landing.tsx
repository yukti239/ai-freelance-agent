import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, CheckCircle2, ArrowRight, Bot, BarChart3, Lock, Sparkles, Globe, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "AI Requirement Analyzer",
      description: "Instantly break down complex projects into actionable milestones with AI-driven roadmaps."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: "Autonomous Escrow",
      description: "Funds are locked in secure AI-controlled escrow and released only upon verified completion."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: "AI Quality Assurance",
      description: "Our AI agent automatically verifies work quality and checklist coverage before payment."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "PFI Scoring",
      description: "Professional Fidelity Index tracks freelancer reputation based on real performance data."
    }
  ];

  const steps = [
    { number: "01", title: "Post Project", desc: "Define your vision and let AI analyze the requirements." },
    { number: "02", title: "Lock Escrow", desc: "Deposit funds into the secure AI-managed escrow wallet." },
    { number: "03", title: "AI Verification", desc: "Freelancer submits work; AI verifies quality autonomously." },
    { number: "04", title: "Instant Release", desc: "Payment is released immediately upon AI approval." }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tight">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-white/10">
              <Lock className="w-5 h-5" />
            </div>
            TrustBridge AI
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Protocol</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-200 transition-all"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">
              <Sparkles className="w-3 h-3" />
              <span>Next-Gen Autonomous Freelancing</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-display font-bold tracking-tighter mb-12 leading-[0.85] uppercase">
              The AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-blue-500">
                Intermediary
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              The world's first autonomous escrow protocol. Automated milestones, verified work, and instant payments powered by advanced AI agents.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-12 py-6 bg-white text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-white/10 hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-12 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all text-[10px] uppercase tracking-[0.2em] text-zinc-400"
              >
                View Protocol
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Escrow Secured", value: "$2.4M+" },
              { label: "AI Verifications", value: "140k+" },
              { label: "Avg. Release", value: "12s" },
              { label: "Active Nodes", value: "842" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                <p className="text-4xl font-display font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol in Action (Demo) */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6">Autonomous Verification</h2>
            <h3 className="text-5xl md:text-6xl font-display font-bold tracking-tight">Protocol in Action</h3>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 rounded-[40px] blur-2xl opacity-50" />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              {/* Mock Dashboard Header */}
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI_AGENT_NODE_0842 // ACTIVE</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                {/* Left: AI Analysis */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Bot className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Agent Analysis</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Scanning Repository...</p>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 space-y-2">
                      <p className="text-emerald-400 opacity-80">{">"} Analyzing PR #142</p>
                      <p>{">"} Checking unit tests...</p>
                      <p>{">"} Verifying API endpoints...</p>
                      <p className="text-blue-400">{">"} 94% Quality Match</p>
                    </div>
                  </div>
                </div>

                {/* Center: Milestone Status */}
                <div className="p-8 bg-white/[0.01]">
                  <div className="flex items-center gap-3 mb-8">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Milestone 02</h4>
                  </div>
                  <div className="text-center py-6">
                    <div className="text-4xl font-display font-bold mb-2">$4,200.00</div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Locked in Escrow</p>
                  </div>
                  <div className="mt-8 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Verified</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/60">0x8f...2e1a</span>
                  </div>
                </div>

                {/* Right: PFI Impact */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Reputation Delta</h4>
                  </div>
                  <div className="flex items-end gap-4 mb-6">
                    <div className="text-5xl font-display font-bold">842</div>
                    <div className="text-emerald-400 text-sm font-bold mb-2">+12 PFI</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                      <span>Reliability</span>
                      <span className="text-white">98%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full">
                      <div className="h-full w-[98%] bg-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6">Core Infrastructure</h2>
              <h3 className="text-5xl md:text-6xl font-display font-bold tracking-tight">Built for the <br /> Autonomous Economy</h3>
            </div>
            <p className="text-zinc-500 max-w-md font-light text-lg">Our protocol eliminates the trust gap between global talent and employers through verifiable AI logic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-[40px] group-hover:bg-emerald-500/10 transition-all" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6">The Protocol</h2>
            <h3 className="text-5xl md:text-6xl font-display font-bold tracking-tight">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 text-center group">
                <div className="w-20 h-20 rounded-[32px] bg-[#050505] border border-emerald-500/30 flex items-center justify-center mx-auto mb-10 text-emerald-400 font-display font-bold text-2xl shadow-[0_0_40px_rgba(16,185,129,0.1)] group-hover:scale-110 group-hover:border-emerald-500 transition-all">
                  {step.number}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-light px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-500/10 blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="p-16 md:p-24 rounded-[64px] bg-[#0A0A0A] border border-white/10 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-12 leading-tight tracking-tight">
              Ready to build the <br /> future of work?
            </h2>
            <button
              onClick={() => navigate('/login')}
              className="px-16 py-6 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-white/10 text-lg"
            >
              Join the Network
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
            <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tight">
              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10">
                <Lock className="w-5 h-5" />
              </div>
              TrustBridge AI
            </div>
            <div className="flex gap-12 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">© 2026 TrustBridge AI Protocol. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Globe className="w-4 h-4 text-zinc-600" />
              <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Global Node Network Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
