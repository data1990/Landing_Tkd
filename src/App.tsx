import { useState, useEffect } from 'react';
import { auth, db, signIn, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClassList from './components/ClassList';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'landing' | 'admin'>('landing');
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const isDefaultAdmin = currentUser.email === "ngochoang.itqt@gmail.com";
        setIsAdmin(isDefaultAdmin || userDoc.data()?.role === 'admin');
      } else {
        setIsAdmin(false);
        setView('landing');
      }
      setLoading(false);
    });

    const qTrainers = query(collection(db, 'trainers'), orderBy('createdAt', 'desc'));
    const unsubscribeTrainers = onSnapshot(qTrainers, (snap) => {
      setTrainers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTrainers();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-primary">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep cursor-none">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />
      <CustomCursor />
      <Navbar 
        user={user} 
        isAdmin={isAdmin} 
        onSignIn={signIn} 
        onLogout={logout} 
        onToggleView={() => setView(view === 'landing' ? 'admin' : 'landing')}
        currentView={view}
      />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero />
              
              {/* Classes Section */}
              <motion.section 
                id="lớp-học" 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-32 bg-bg-deep relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                      <span className="font-mono text-primary text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Training Programs</span>
                      <h2 className="text-5xl md:text-7xl">CÁC LỚP <span className="text-primary">ĐÀO TẠO</span></h2>
                    </div>
                    <p className="text-white/40 max-w-sm text-sm font-medium leading-relaxed">
                      Chúng tôi cung cấp lộ trình bài bản từ cơ bản đến chuyên nghiệp cho mọi lứa tuổi.
                    </p>
                  </div>
                  <ClassList />
                </div>
              </motion.section>

              {/* About Section */}
              <motion.section 
                id="giới-thiệu" 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-32 bg-bg-card relative"
              >
                <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
                  <div className="relative group">
                    <div className="absolute -inset-4 border border-primary/20 skew-x-negative group-hover:border-primary/50 transition-colors duration-500" />
                    <img 
                      src="https://picsum.photos/seed/tkd-action/1000/1200" 
                      alt="Taekwondo Action" 
                      className="relative z-10 w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1/2 -right-10 z-20 hidden xl:block">
                      <p className="text-[120px] font-black text-stroke opacity-10 select-none">SPIRIT</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-mono text-accent text-xs uppercase tracking-[0.4em] font-bold mb-6 block">Our Philosophy</span>
                    <h2 className="text-5xl md:text-6xl mb-10 leading-tight">
                      HƠN CẢ MỘT <br />
                      <span className="text-primary">MÔN VÕ THUẬT</span>
                    </h2>
                    <p className="text-xl text-white/60 mb-12 leading-relaxed">
                      Tại CLB Taekwondo, chúng tôi tin rằng võ thuật là chìa khóa để khai phá tiềm năng con người. 
                      Mỗi buổi tập là một hành trình rèn luyện ý chí, lòng kiên trì và sự tôn trọng.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                      {[
                        { title: "Kỷ luật", desc: "Xây dựng thói quen và sự tự giác cao độ." },
                        { title: "Tự vệ", desc: "Kỹ năng bảo vệ bản thân trong mọi tình huống." },
                        { title: "Sức khỏe", desc: "Phát triển thể chất toàn diện và bền bỉ." },
                        { title: "Đạo đức", desc: "Học cách tôn trọng và khiêm nhường." }
                      ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                          <h4 className="text-primary text-xl mb-2 italic">{item.title}</h4>
                          <p className="text-white/40 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Trainers Section */}
              <motion.section 
                id="huấn-luyện-viên" 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-32 bg-bg-deep"
              >
                <div className="container mx-auto px-4">
                  <div className="text-center mb-24">
                    <span className="font-mono text-primary text-xs uppercase tracking-[0.4em] font-bold mb-4 block">Expert Masters</span>
                    <h2 className="text-5xl md:text-7xl">ĐỘI NGŨ <span className="text-primary">HLV</span></h2>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-12">
                    {trainers.length > 0 ? trainers.map((trainer, i) => (
                      <motion.div 
                        key={trainer.id}
                        whileHover={{ y: -10 }}
                        className="group relative overflow-hidden"
                      >
                        <img 
                          src={trainer.imageUrl || `https://picsum.photos/seed/${trainer.id}/600/800`} 
                          alt={trainer.name} 
                          className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                          <p className="text-accent font-mono text-[10px] uppercase tracking-widest mb-2">{trainer.rank}</p>
                          <h4 className="text-2xl italic">{trainer.name}</h4>
                        </div>
                      </motion.div>
                    )) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-sm" />
                      ))
                    )}
                  </div>
                </div>
              </motion.section>

              {/* Gallery Section */}
              <motion.section 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="py-32 bg-bg-card"
              >
                <div className="container mx-auto px-4">
                  <div className="flex items-center justify-between mb-16">
                    <h2 className="text-4xl md:text-6xl">KHOẢNH <span className="text-primary">KHẮC</span></h2>
                    <div className="hidden md:block h-px flex-grow mx-12 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="overflow-hidden aspect-square group">
                        <img 
                          src={`https://picsum.photos/seed/gallery-${i}/800/800`} 
                          alt="Gallery" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
