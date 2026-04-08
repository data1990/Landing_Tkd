import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface RegistrationModalProps {
  classData: { id: string; title: string };
  onClose: () => void;
}

export default function RegistrationModal({ classData, onClose }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        classId: classData.id,
        classTitle: classData.title,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setTimeout(onClose, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1a1a1a] w-full max-w-md rounded-sm border border-white/10 shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-10">
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={56} />
              </div>
              <h3 className="text-3xl mb-4 italic">ĐĂNG KÝ THÀNH CÔNG!</h3>
              <p className="text-white/40 font-medium">Chúng tôi sẽ liên hệ với bạn trong vòng 24h tới.</p>
            </div>
          ) : (
            <>
              <span className="font-mono text-primary text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">Registration Form</span>
              <h3 className="text-4xl mb-2 italic">ĐĂNG KÝ LỚP</h3>
              <p className="text-accent font-black text-sm uppercase tracking-widest mb-10">{classData.title}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Tên học viên *</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="NGUYỄN VĂN A"
                    value={formData.studentName}
                    onChange={e => setFormData({...formData, studentName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Tên phụ huynh</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="NGUYỄN VĂN B"
                    value={formData.parentName}
                    onChange={e => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Số điện thoại *</label>
                    <input 
                      required
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="090..."
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Email</label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="EMAIL@GMAIL.COM"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 mt-6 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : <><Send size={18} /> GỬI ĐĂNG KÝ</>}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
