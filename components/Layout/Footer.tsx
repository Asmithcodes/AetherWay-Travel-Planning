
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-12 border-t border-slate-800/50 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">A</div>
          <span className="text-slate-400 font-medium">AetherWays — Kinetic Travel Intel</span>
        </div>
        <div className="text-sm text-slate-500">
          Developed by <a href="mailto:asmyth@duck.com" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">Asmith — asmyth@duck.com</a>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-slate-300 cursor-pointer transition-colors">Support</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
