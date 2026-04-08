import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, LayoutDashboard, Home, Menu, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Magnetic from './Magnetic';

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  onSignIn: () => void;
  onLogout: () => void;
  onToggleView: () => void;
  currentView: 'landing' | 'admin';
}

export default function Navbar({ user, isAdmin, onSignIn, onLogout, onToggleView, currentView }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubSettings = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setLogoUrl(snap.data().logoUrl || null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubSettings();
    };
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-bg-deep/90 backdrop-blur-xl border-b border-white/10 py-2' : 'bg-transparent border-b border-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Magnetic>
            <div className="flex items-center gap-3 cursor-pointer">
              {logoUrl ? (
                <img src={logoUrl} alt="Club Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="w-12 h-12 bg-primary skew-x-negative flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-primary/20">
                  <span className="skew-x-[12deg]">T</span>
                </div>
              )}
              <span className="font-display font-black text-2xl tracking-tighter text-white uppercase italic">
                CLB <span className="text-primary">TAEKWONDO</span>
              </span>
            </div>
          </Magnetic>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {['Trang chủ', 'Lớp học', 'Huấn luyện viên', 'Liên hệ'].map((item) => (
              <div key={item}>
                <Magnetic>
                  <a 
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                    className="text-sm font-black uppercase tracking-widest hover:text-accent transition-colors relative group block py-2"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                  </a>
                </Magnetic>
              </div>
            ))}
            
            <div className="h-8 w-px bg-white/10 mx-2" />

            {user ? (
              <div className="flex items-center gap-6">
                {isAdmin && (
                  <button 
                    onClick={onToggleView}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                  >
                    {currentView === 'landing' ? (
                      <><LayoutDashboard size={16} /> Quản trị</>
                    ) : (
                      <><Home size={16} /> Trang chủ</>
                    )}
                  </button>
                )}
                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                  <img src={user.photoURL || ''} alt="" className="w-9 h-9 rounded-full border-2 border-primary shadow-lg shadow-primary/20" />
                  <button onClick={onLogout} className="text-white/50 hover:text-sport-red transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20"
              >
                <LogIn size={18} /> Đăng nhập
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-deep border-b border-white/10 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {['Trang chủ', 'Lớp học', 'Huấn luyện viên', 'Liên hệ'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="block text-lg font-black uppercase tracking-widest text-white/80 hover:text-accent">
                  {item}
                </a>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <div className="space-y-4">
                  {isAdmin && (
                    <button onClick={onToggleView} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/10 font-black uppercase text-sm tracking-widest">
                      {currentView === 'landing' ? 'Quản trị' : 'Trang chủ'}
                    </button>
                  )}
                  <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-sport-red/10 text-sport-red font-black uppercase text-sm tracking-widest">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button onClick={onSignIn} className="w-full py-4 rounded-xl bg-accent text-black font-black uppercase text-sm tracking-widest">
                  Đăng nhập
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
