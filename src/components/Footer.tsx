import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const [settings, setSettings] = useState({
    address: '123 Đường Võ Thuật, Quận 1, TP. HCM',
    phone: '090 123 4567',
    email: 'contact@clbtaekwondo.vn'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
    });
    return () => unsub();
  }, []);

  return (
    <footer id="liên-hệ" className="bg-bg-deep text-white pt-32 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-10">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Club Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="w-12 h-12 bg-primary skew-x-negative flex items-center justify-center text-white font-black text-2xl italic">
                  <span className="skew-x-[12deg]">T</span>
                </div>
              )}
              <span className="font-display font-black text-3xl tracking-tighter text-white uppercase italic">
                CLB <span className="text-primary">TAEKWONDO</span>
              </span>
            </div>
            <p className="text-white/40 max-w-md mb-12 text-lg leading-relaxed font-medium">
              Chúng tôi không chỉ dạy võ thuật, chúng tôi xây dựng những nhà vô địch trong cuộc sống. 
              Gia nhập cộng đồng của chúng tôi ngay hôm nay.
            </p>
            <div className="flex gap-6">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-14 h-14 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group">
                  <Icon size={24} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-mono text-accent text-xs uppercase tracking-[0.4em] font-bold mb-10 block">Quick Links</h4>
            <ul className="space-y-6">
              {['Trang chủ', 'Lớp học', 'Huấn luyện viên', 'Liên hệ'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-white/60 hover:text-white font-black uppercase tracking-widest text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-mono text-accent text-xs uppercase tracking-[0.4em] font-bold mb-10 block">Contact Info</h4>
            <ul className="space-y-8">
              <li className="flex gap-6 group">
                <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Địa chỉ</p>
                  <p className="text-white/80 font-bold">{settings.address}</p>
                </div>
              </li>
              <li className="flex gap-6 group">
                <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  <Phone size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Điện thoại</p>
                  <p className="text-white/80 font-bold">{settings.phone}</p>
                </div>
              </li>
              <li className="flex gap-6 group">
                <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Email</p>
                  <p className="text-white/80 font-bold">{settings.email}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} CLB Taekwondo. Designed for Champions.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-white/20 hover:text-white/40 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/20 hover:text-white/40 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
