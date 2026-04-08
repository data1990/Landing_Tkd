import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Users, BookOpen, Save, X, ShieldCheck, Settings, Upload, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'classes' | 'registrations' | 'trainers' | 'settings'>('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    address: '123 Đường Võ Thuật, Quận 1, TP. HCM',
    phone: '090 123 4567',
    email: 'contact@taekwondoclub.vn',
    logoUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    ageRange: '',
    schedule: '',
    location: '',
    description: '',
    imageUrl: ''
  });
  const [trainerData, setTrainerData] = useState({
    name: '',
    rank: '',
    imageUrl: '',
    description: ''
  });

  useEffect(() => {
    const qClasses = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsubClasses = onSnapshot(qClasses, (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qRegs = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubRegs = onSnapshot(qRegs, (snap) => {
      setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qTrainers = query(collection(db, 'trainers'), orderBy('createdAt', 'desc'));
    const unsubTrainers = onSnapshot(qTrainers, (snap) => {
      setTrainers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
    });

    return () => { unsubClasses(); unsubRegs(); unsubTrainers(); unsubSettings(); };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      alert('Đã cập nhật thông tin liên hệ thành công!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/contact');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 500KB for Firestore)
    if (file.size > 512 * 1024) {
      alert('Tệp quá lớn! Vui lòng chọn ảnh dưới 500KB để đảm bảo hiệu suất.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSettings(prev => ({ ...prev, logoUrl: base64String }));
        setIsUploading(false);
        alert('Đã xử lý logo thành công! Hãy nhấn "LƯU CẤU HÌNH" để áp dụng thay đổi.');
      };
      reader.onerror = () => {
        throw new Error('Lỗi khi đọc tệp.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing logo:', err);
      alert('Lỗi khi xử lý logo. Vui lòng thử lại.');
      setIsUploading(false);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'classes', isEditing), formData);
      } else {
        await addDoc(collection(db, 'classes'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setFormData({ title: '', ageRange: '', schedule: '', location: '', description: '', imageUrl: '' });
      setIsEditing(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'classes');
    }
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'trainers', isEditing), trainerData);
      } else {
        await addDoc(collection(db, 'trainers'), {
          ...trainerData,
          createdAt: serverTimestamp()
        });
      }
      setTrainerData({ name: '', rank: '', imageUrl: '', description: '' });
      setIsEditing(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'trainers');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
    try {
      await deleteDoc(doc(db, 'classes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'classes');
    }
  };

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa huấn luyện viên này?')) return;
    try {
      await deleteDoc(doc(db, 'trainers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'trainers');
    }
  };

  const handleUpdateRegStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'registrations');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-72 space-y-3">
          <div className="mb-10">
            <h2 className="text-3xl italic mb-2">ADMIN PANEL</h2>
            <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Control Center</p>
          </div>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-4 px-8 py-5 rounded-sm font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'classes' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <BookOpen size={18} /> Lớp tập & Lịch học
          </button>
          <button 
            onClick={() => setActiveTab('trainers')}
            className={`w-full flex items-center gap-4 px-8 py-5 rounded-sm font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'trainers' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <ShieldCheck size={18} /> Huấn luyện viên
          </button>
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center gap-4 px-8 py-5 rounded-sm font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'registrations' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Users size={18} /> Đăng ký
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-8 py-5 rounded-sm font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Settings size={18} /> Cấu hình thông tin
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow">
          {activeTab === 'classes' ? (
            <div className="space-y-12">
              <div className="bg-bg-card p-10 rounded-sm border border-white/10 shadow-2xl">
                <h3 className="text-2xl mb-8 flex items-center gap-3 italic">
                  {isEditing ? <Edit2 size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
                  {isEditing ? 'CẬP NHẬT LỚP TẬP & LỊCH HỌC' : 'THÊM LỚP TẬP MỚI'}
                </h3>
                <form onSubmit={handleSaveClass} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tên lớp tập</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="VD: Lớp Thiếu Nhi Cơ Bản"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Độ tuổi</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={formData.ageRange}
                        onChange={e => setFormData({...formData, ageRange: e.target.value})}
                        placeholder="VD: 6 - 12 tuổi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Thời khóa biểu (Lịch học)</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={formData.schedule}
                        onChange={e => setFormData({...formData, schedule: e.target.value})}
                        placeholder="VD: Thứ 2-4-6 | 18:00 - 19:30"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Địa điểm tập luyện</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="VD: Sân tập A, Nhà văn hóa"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Link hình ảnh</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mô tả chi tiết</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all h-[58px]"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-4">
                    <button type="submit" className="flex-grow py-5 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                      <Save size={20} /> {isEditing ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN THÊM LỚP'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(null);
                          setFormData({ title: '', ageRange: '', schedule: '', location: '', description: '', imageUrl: '' });
                        }}
                        className="px-10 py-5 bg-white/5 text-white/60 font-black uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all"
                      >
                        HỦY
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="grid gap-6">
                <h3 className="text-xl italic text-white/60 uppercase tracking-widest">DANH SÁCH LỚP TẬP & THỜI KHÓA BIỂU</h3>
                {classes.map(cls => (
                  <div key={cls.id} className="bg-bg-card p-8 rounded-sm border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div>
                      <h4 className="text-2xl italic mb-2 group-hover:text-primary transition-colors">{cls.title}</h4>
                      <div className="flex flex-wrap gap-4">
                        <p className="text-xs font-mono uppercase tracking-widest text-white/40">
                          <span className="text-primary/60">Độ tuổi:</span> {cls.ageRange}
                        </p>
                        <p className="text-xs font-mono uppercase tracking-widest text-white/40">
                          <span className="text-primary/60">Lịch:</span> {cls.schedule}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setIsEditing(cls.id);
                          setFormData({
                            title: cls.title,
                            ageRange: cls.ageRange,
                            schedule: cls.schedule,
                            location: cls.location,
                            description: cls.description || '',
                            imageUrl: cls.imageUrl || ''
                          });
                        }}
                        className="w-12 h-12 flex items-center justify-center text-primary hover:bg-primary/10 rounded-sm transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClass(cls.id)}
                        className="w-12 h-12 flex items-center justify-center text-sport-red hover:bg-sport-red/10 rounded-sm transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'trainers' ? (
            <div className="space-y-12">
              <div className="bg-bg-card p-10 rounded-sm border border-white/10 shadow-2xl">
                <h3 className="text-2xl mb-8 flex items-center gap-3 italic">
                  {isEditing ? <Edit2 size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
                  {isEditing ? 'CẬP NHẬT HUẤN LUYỆN VIÊN' : 'THÊM HUẤN LUYỆN VIÊN'}
                </h3>
                <form onSubmit={handleSaveTrainer} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Họ tên HLV</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={trainerData.name}
                        onChange={e => setTrainerData({...trainerData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cấp bậc / Đẳng</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={trainerData.rank}
                        onChange={e => setTrainerData({...trainerData, rank: e.target.value})}
                        placeholder="VD: Huyền đai 5 đẳng"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Link ảnh chân dung</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                        value={trainerData.imageUrl}
                        onChange={e => setTrainerData({...trainerData, imageUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mô tả ngắn</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all h-[58px]"
                        value={trainerData.description}
                        onChange={e => setTrainerData({...trainerData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-4">
                    <button type="submit" className="flex-grow py-5 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                      <Save size={20} /> {isEditing ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN THÊM HLV'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(null);
                          setTrainerData({ name: '', rank: '', imageUrl: '', description: '' });
                        }}
                        className="px-10 py-5 bg-white/5 text-white/60 font-black uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all"
                      >
                        HỦY
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="grid gap-6">
                {trainers.map(trainer => (
                  <div key={trainer.id} className="bg-bg-card p-8 rounded-sm border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-6">
                      <img src={trainer.imageUrl || 'https://picsum.photos/seed/trainer/200'} alt="" className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div>
                        <h4 className="text-2xl italic mb-1 group-hover:text-primary transition-colors">{trainer.name}</h4>
                        <p className="text-xs font-mono uppercase tracking-widest text-white/40">{trainer.rank}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setIsEditing(trainer.id);
                          setTrainerData({
                            name: trainer.name,
                            rank: trainer.rank,
                            imageUrl: trainer.imageUrl || '',
                            description: trainer.description || ''
                          });
                        }}
                        className="w-12 h-12 flex items-center justify-center text-primary hover:bg-primary/10 rounded-sm transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrainer(trainer.id)}
                        className="w-12 h-12 flex items-center justify-center text-sport-red hover:bg-sport-red/10 rounded-sm transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="space-y-12">
              <div className="bg-bg-card p-10 rounded-sm border border-white/10 shadow-2xl">
                <h3 className="text-2xl mb-8 flex items-center gap-3 italic">
                  <Settings size={24} className="text-primary" />
                  CẤU HÌNH THÔNG TIN LIÊN HỆ
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Logo Câu lạc bộ</label>
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center overflow-hidden relative group">
                            {settings.logoUrl ? (
                              <img src={settings.logoUrl} alt="Club Logo" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-12 h-12 bg-primary skew-x-negative flex items-center justify-center text-white font-black text-2xl italic">
                                <span className="skew-x-[12deg]">T</span>
                              </div>
                            )}
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="text-primary animate-spin" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow space-y-3">
                            <label className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-sm font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all">
                              <Upload size={14} className="text-primary" />
                              {isUploading ? 'Đang xử lý...' : 'Tải lên Logo mới'}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={isUploading}
                              />
                            </label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="Hoặc dán URL logo tại đây..."
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-white/20"
                              />
                            </div>
                            <p className="text-[10px] text-white/30 italic">Khuyên dùng ảnh PNG hoặc SVG nền trong suốt dưới 500KB.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Địa chỉ CLB</label>
                        <input 
                          required
                          className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                          value={settings.address}
                          onChange={e => setSettings({...settings, address: e.target.value})}
                          placeholder="VD: 123 Đường Võ Thuật, Quận 1..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Số điện thoại</label>
                        <input 
                          required
                          className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                          value={settings.phone}
                          onChange={e => setSettings({...settings, phone: e.target.value})}
                          placeholder="VD: 090 123 4567"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email liên hệ</label>
                        <input 
                          required
                          type="email"
                          className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-sm text-white outline-none focus:border-primary transition-all"
                          value={settings.email}
                          onChange={e => setSettings({...settings, email: e.target.value})}
                          placeholder="VD: contact@taekwondoclub.vn"
                        />
                      </div>
                      <div className="pt-6">
                        <p className="text-xs text-white/40 italic">
                          * Thông tin này sẽ được hiển thị ở phần chân trang (Footer) và các thông tin liên hệ trên toàn website.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-sm flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                    <Save size={20} /> LƯU CẤU HÌNH
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-bg-card rounded-sm border border-white/10 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Học viên</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Liên hệ</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Lớp học</th>
                      <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black italic text-lg">{reg.studentName}</p>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">PH: {reg.parentName || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white/80">{reg.phone}</p>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">{reg.email || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black uppercase tracking-widest text-primary">{reg.classTitle}</p>
                        </td>
                        <td className="px-8 py-6">
                          <select 
                            value={reg.status}
                            onChange={(e) => handleUpdateRegStatus(reg.id, e.target.value)}
                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-sm border-none outline-none cursor-pointer ${
                              reg.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                              reg.status === 'cancelled' ? 'bg-sport-red/10 text-sport-red' : 
                              'bg-accent/10 text-accent'
                            }`}
                          >
                            <option value="pending">Chờ duyệt</option>
                            <option value="confirmed">Xác nhận</option>
                            <option value="cancelled">Hủy bỏ</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
