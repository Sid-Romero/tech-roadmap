
import React from 'react';
import { Rocket, Clock, Trophy, ArrowRight, Layout } from './Icons.api';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-ocean-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-ocean-600/20">TR</div>
           <span className="font-bold text-lg tracking-tight">Tech Roadmap</span>
        </div>
        <div className="flex gap-4">
           <button onClick={onLogin} className="text-slate-600 font-medium hover:text-ocean-600 transition-colors">Sign In</button>
           <button onClick={onLogin} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-30" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ocean-500/10 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="relative z-10 max-w-3xl mx-auto space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-100 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Rocket size={14}/> v2.0 is Live
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-500 to-sky-500">Tech Stack.</span>
             </h1>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                The ultimate gamified dashboard for developers. Plan your roadmap, track deep work sessions, and level up your career from Novice to Architect.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                 <button onClick={onLogin} className="flex items-center justify-center gap-2 bg-ocean-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-ocean-500 transition-all shadow-xl shadow-ocean-600/20 hover:scale-105">
                    Start Your Journey <ArrowRight size={20}/>
                 </button>
                 <button onClick={onLogin} className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all hover:border-slate-300">
                    View Demo
                 </button>
             </div>
         </div>
      </header>

      {/* Features */}
      <section className="py-24 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-ocean-200 transition-colors group">
                      <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Layout size={28}/>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Skill Trees & Roadmaps</h3>
                      <p className="text-slate-500 leading-relaxed">Visualize your learning path. Create nodes, define dependencies, and track complexity across your tech stack.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-ocean-200 transition-colors group">
                      <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Clock size={28}/>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Work Tracking</h3>
                      <p className="text-slate-500 leading-relaxed">Built-in focus timer with Pomodoro support. Log sessions directly to your projects and analyze your productivity.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-ocean-200 transition-colors group">
                      <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Trophy size={28}/>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">RPG Gamification</h3>
                      <p className="text-slate-500 leading-relaxed">Earn XP, unlock badges, and rank up from "Script Kiddie" to "10x Engineer" as you complete real-world tasks.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-50 border-t border-slate-200 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
             <div className="w-6 h-6 bg-slate-400 rounded-md flex items-center justify-center text-white font-bold text-xs">TR</div>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Tech Roadmap Tracker. Built for builders.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
