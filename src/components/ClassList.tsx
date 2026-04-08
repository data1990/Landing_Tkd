import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import RegistrationModal from './RegistrationModal';
import Magnetic from './Magnetic';

interface ClassData {
  id: string;
  title: string;
  ageRange: string;
  schedule: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function ClassList() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
      setClasses(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'classes');
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative bg-bg-card rounded-sm overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500"
          >
            {/* Image Container */}
            <div className="relative h-72 overflow-hidden">
              <img 
                src={cls.imageUrl || `https://picsum.photos/seed/${cls.id}/800/600`} 
                alt={cls.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest skew-x-negative inline-block">
                  <span className="skew-x-[12deg] inline-block">{cls.ageRange}</span>
                </span>
              </div>
            </div>
            
            <div className="p-8 relative">
              {/* Decorative Number */}
              <span className="absolute top-4 right-8 text-6xl font-black text-white/5 italic pointer-events-none">
                0{index + 1}
              </span>

              <h3 className="text-3xl mb-6 group-hover:text-primary transition-colors italic">{cls.title}</h3>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4 text-white/40">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold">Thời gian</p>
                    <p className="text-sm font-bold text-white/80">{cls.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/40">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold">Địa điểm</p>
                    <p className="text-sm font-bold text-white/80">{cls.location}</p>
                  </div>
                </div>
              </div>

              <Magnetic>
                <button 
                  onClick={() => setSelectedClass(cls)}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:border-primary transition-all duration-300 flex items-center justify-center gap-3"
                >
                  ĐĂNG KÝ THAM GIA <ChevronRight size={16} />
                </button>
              </Magnetic>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedClass && (
        <RegistrationModal 
          classData={selectedClass} 
          onClose={() => setSelectedClass(null)} 
        />
      )}
    </>
  );
}
