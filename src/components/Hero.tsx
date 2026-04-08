import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Trophy, Users, ShieldCheck, MapPin } from 'lucide-react';
import Magnetic from './Magnetic';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-deep">
      {/* Background Image with Overlay */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/taekwondo-hero/1920/1080?blur=2" 
          alt="Taekwondo Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/80 to-transparent" />
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-accent/10 rounded-full blur-[150px] animate-float" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-1 bg-accent" />
              <span className="font-mono text-accent text-sm uppercase tracking-[0.3em] font-bold">
                Elite Martial Arts Academy
              </span>
            </div>
            
            <h1 className="text-[12vw] md:text-[8vw] lg:text-[100px] leading-[0.85] mb-10 overflow-hidden">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="block text-stroke opacity-50"
              >
                CHINH PHỤC
              </motion.span>
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="block italic"
              >
                SỨC MẠNH
              </motion.span>
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="block text-primary"
              >
                VÔ HẠN
              </motion.span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl leading-relaxed font-medium">
              Nơi hội tụ đam mê, kỷ luật và tinh thần võ sĩ. 
              Tham gia cùng chúng tôi để bứt phá giới hạn bản thân ngay hôm nay.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Magnetic>
                <a 
                  href="#lớp-học" 
                  className="group relative px-10 py-5 bg-accent text-black font-black text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-accent/20 block"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    BẮT ĐẦU NGAY <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </a>
              </Magnetic>
              
              <Magnetic>
                <a 
                  href="#huấn-luyện-viên" 
                  className="px-10 py-5 border-2 border-white/20 hover:border-white/40 rounded-sm font-black text-lg uppercase tracking-widest transition-all hover:bg-white/5 block"
                >
                  ĐỘI NGŨ HLV
                </a>
              </Magnetic>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 pt-12 border-t border-white/10"
          >
            {[
              { label: 'Học viên', value: '200+', icon: Users },
              { label: 'Huy chương', value: '50+', icon: Trophy },
              { label: 'Kinh nghiệm', value: '10Y', icon: ShieldCheck },
              { label: 'Cơ sở', value: '03', icon: MapPin }
            ].map((stat, i) => (
              <div key={i} className="group cursor-default">
                <p className="text-3xl font-black text-white group-hover:text-accent transition-colors">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-hover:text-white/60 transition-colors">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Side Rail Text */}
      <div className="absolute right-8 bottom-24 hidden lg:block">
        <p className="writing-mode-vertical-rl rotate-180 text-[10px] font-mono uppercase tracking-[0.5em] text-white/20">
          ESTABLISHED 2016 • TAEKWONDO SPIRIT • VIETNAM
        </p>
      </div>
    </section>
  );
}
