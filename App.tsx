
import React, { useState, useEffect } from 'react';
import { Drama, UserProfile, Transaction, AdConfig } from './types';
import DramaCard from './components/VideoCard';
import UploadModal from './components/UploadModal';
import AdZone from './components/AdZone';

type Page = 'HOME' | 'WATCH' | 'REWARDS' | 'PROFILE' | 'ADMIN_DASHBOARD';
type ModalType = 'NONE' | 'PURCHASES' | 'SECURITY' | 'RENAME';
type AdminTab = 'KONTEN' | 'USER' | 'IKLAN';

const App: React.FC = () => {
  const [dramas, setDramas] = useState<Drama[]>(() => {
    const saved = localStorage.getItem('lolong_dramas');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState<Page>('HOME');
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [adminTab, setAdminTab] = useState<AdminTab>('KONTEN');
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState(0);
  const [isCheckingIP, setIsCheckingIP] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lolong_user');
    return saved ? JSON.parse(saved) : {
      id: 'u-' + Date.now(),
      name: 'User Lolong',
      coins: 100,
      isVip: false,
      history: [],
      favorites: [],
      transactions: [
        { id: 't-init', date: new Date().toLocaleDateString(), type: 'REWARD', label: 'Welcome Bonus LOLONG', amount: 100, status: 'SUCCESS' }
      ],
      lastCheckIn: '',
      role: 'USER'
    };
  });

  const [ads, setAds] = useState<AdConfig[]>(() => {
    const saved = localStorage.getItem('lolong_ads');
    return saved ? JSON.parse(saved) : [
      { id: 'ad-top', position: 'TOP', scriptCode: '', isActive: false },
      { id: 'ad-bottom', position: 'BOTTOM', scriptCode: '', isActive: false }
    ];
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    localStorage.setItem('lolong_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lolong_dramas', JSON.stringify(dramas));
  }, [dramas]);

  useEffect(() => {
    localStorage.setItem('lolong_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setUser(prev => ({ ...prev, ipAddress: data.ip }));
      } catch (e) { console.error("IP Detect Failed"); }
    };
    fetchIP();
  }, []);

  const addTransaction = (type: Transaction['type'], label: string, amount: number) => {
    const newTx: Transaction = {
      id: 't-' + Date.now(),
      date: new Date().toLocaleString('id-ID'),
      type, label, amount, status: 'SUCCESS'
    };
    setUser(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions].slice(0, 50)
    }));
  };

  const handleDeleteDrama = (id: string) => {
    if (confirm('Hapus video ini secara permanen?')) {
      setDramas(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleUpdateAd = (pos: 'TOP' | 'BOTTOM', code: string) => {
    setAds(prev => prev.map(ad => ad.position === pos ? { ...ad, scriptCode: code, isActive: code.length > 0 } : ad));
    alert('Script Iklan Diperbarui!');
  };

  const handleDramaClick = (drama: Drama) => {
    setSelectedDrama(drama);
    setActiveEpisodeIdx(0);
    setActivePage('WATCH');
  };

  const toggleFavorite = (dramaId: string) => {
    setUser(prev => {
      const isFav = prev.favorites.includes(dramaId);
      const newFavs = isFav 
        ? prev.favorites.filter(id => id !== dramaId)
        : [...prev.favorites, dramaId];
      return { ...prev, favorites: newFavs };
    });
  };

  const claimDailyReward = () => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) return;

    setIsCheckingIP(true);
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        coins: prev.coins + 50,
        lastCheckIn: today
      }));
      addTransaction('REWARD', 'Daily Check-in Bonus', 50);
      setIsCheckingIP(false);
      alert('Mantap! 50 Koin mendarat di dompet.');
    }, 1500);
  };

  const openRenameModal = () => {
    setTempName(user.name);
    setActiveModal('RENAME');
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUser(prev => ({ ...prev, name: tempName }));
      setActiveModal('NONE');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'admin' && loginForm.pass === 'lolong123') {
      setIsAdmin(true);
      setShowLogin(false);
      setActivePage('ADMIN_DASHBOARD');
      alert('Akses Admin Diterima. Selamat Datang di Terminal Lolong.');
    } else {
      alert('Kredensial Salah! Periksa kembali.');
    }
  };

  const renderAdminDashboard = () => (
    <div className="p-6 pb-32 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif italic text-white">Lolong Control</h2>
        <button onClick={() => { setIsAdmin(false); setActivePage('PROFILE'); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/30 px-4 py-2 rounded-xl">Exit Terminal</button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        {(['KONTEN', 'USER', 'IKLAN'] as AdminTab[]).map(tab => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === tab ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 min-h-[400px]">
        {adminTab === 'KONTEN' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-white uppercase text-xs tracking-widest">Katalog Video ({dramas.length})</h3>
               <button onClick={() => setShowUpload(true)} className="bg-red-600 px-4 py-2 rounded-xl text-[9px] font-black text-white">TAMBAH +</button>
            </div>
            {dramas.length === 0 ? <p className="text-center text-slate-600 text-xs py-20">Belum ada konten.</p> : (
              <div className="space-y-3">
                {dramas.map(d => (
                  <div key={d.id} className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <img src={d.coverUrl} className="w-12 h-16 object-cover rounded-lg" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white line-clamp-1">{d.title}</p>
                      <p className="text-[8px] text-slate-500 uppercase">{d.genre} • {d.episodes.length} EP</p>
                    </div>
                    <button onClick={() => handleDeleteDrama(d.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {adminTab === 'USER' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase text-xs tracking-widest mb-4">Manajemen Pengguna</h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
               <div className="flex justify-between items-center">
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-white">{user.name} <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 rounded">ADMIN</span></p>
                     <p className="text-[9px] text-slate-500">{user.ipAddress}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-black text-amber-500">{user.coins} 🪙</p>
                     <button onClick={() => {
                       const amt = prompt('Masukkan jumlah koin (Topup manual):', '100');
                       if (amt) {
                         setUser(prev => ({ ...prev, coins: prev.coins + parseInt(amt) }));
                         addTransaction('DEPOSIT', 'Admin Topup', parseInt(amt));
                       }
                     }} className="text-[8px] text-indigo-400 underline uppercase">Edit Saldo</button>
                  </div>
               </div>
            </div>
            <p className="text-[8px] text-slate-600 text-center uppercase mt-4 italic">Sistem LocalStorage: Hanya mendeteksi user saat ini.</p>
          </div>
        )}

        {adminTab === 'IKLAN' && (
          <div className="space-y-6">
            <h3 className="font-bold text-white uppercase text-xs tracking-widest mb-2">Pasang Script Iklan</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Zona Atas (Home Top)</label>
                <textarea 
                  defaultValue={ads.find(a => a.position === 'TOP')?.scriptCode}
                  onBlur={(e) => handleUpdateAd('TOP', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[10px] text-amber-500 h-24 focus:outline-none focus:border-red-600 transition-all font-mono"
                  placeholder="Paste script iklan (AdSense/Adsterra/dll)..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Zona Bawah (Home Bottom)</label>
                <textarea 
                  defaultValue={ads.find(a => a.position === 'BOTTOM')?.scriptCode}
                  onBlur={(e) => handleUpdateAd('BOTTOM', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[10px] text-amber-500 h-24 focus:outline-none focus:border-red-600 transition-all font-mono"
                  placeholder="Paste script iklan (AdSense/Adsterra/dll)..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="main-container max-w-md mx-auto relative border-x border-slate-900 overflow-hidden shadow-2xl bg-slate-950">
      {activePage !== 'WATCH' && (
        <div className="p-8 flex justify-between items-center bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5">
          <h1 className="font-serif italic text-4xl text-white cursor-pointer select-none" onClick={() => setActivePage('HOME')}>Lolong</h1>
          <div className="bg-slate-900 px-5 py-2 rounded-2xl flex items-center gap-3 border border-slate-800 shadow-inner">
            <span className="text-xl">🪙</span><span className="text-sm font-black text-white">{user.coins}</span>
          </div>
        </div>
      )}

      <div className="scroll-container no-scrollbar">
        {activePage === 'HOME' && (
          <div className="p-4 space-y-4 pb-32">
            <AdZone scriptCode={ads.find(a => a.position === 'TOP')?.scriptCode || ''} id="top-banner" />
            
            <div className="px-2">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Cari video gahar...</span>
              </div>
            </div>

            {dramas.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {dramas.map(drama => <DramaCard key={drama.id} drama={drama} onClick={() => handleDramaClick(drama)} />)}
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-80">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl border border-slate-800">🐊</div>
                <p className="font-black text-xs uppercase tracking-[0.2em] text-white">Belum Ada Video</p>
              </div>
            )}

            <AdZone scriptCode={ads.find(a => a.position === 'BOTTOM')?.scriptCode || ''} id="bottom-banner" />
          </div>
        )}

        {activePage === 'WATCH' && selectedDrama && (
          <div className="flex-1 flex flex-col bg-black animate-in fade-in duration-500 min-h-screen">
             <div className="relative aspect-video bg-zinc-900 w-full overflow-hidden shadow-2xl">
               <iframe src={selectedDrama.episodes[activeEpisodeIdx].url} className="w-full h-full" allowFullScreen scrolling="no" title="Player" />
               <button onClick={() => setActivePage('HOME')} className="absolute top-4 left-4 w-12 h-12 bg-black/60 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white border border-white/10">✕</button>
             </div>
             <div className="flex-1 p-8 space-y-8 bg-slate-950 overflow-y-auto no-scrollbar pb-32">
               <div className="flex justify-between items-start">
                 <div className="space-y-2">
                   <h2 className="text-3xl font-serif italic text-white">{selectedDrama.title}</h2>
                   <div className="flex gap-3 items-center">
                     <span className="text-[10px] bg-red-600 px-3 py-1.5 rounded-lg font-black uppercase text-white">Ep {selectedDrama.episodes[activeEpisodeIdx].episodeNumber}</span>
                   </div>
                 </div>
                 <button onClick={() => toggleFavorite(selectedDrama.id)} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all border-2 ${user.favorites.includes(selectedDrama.id) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-800 text-slate-600'}`}>♥</button>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed font-medium">{selectedDrama.description}</p>
             </div>
          </div>
        )}

        {activePage === 'REWARDS' && (
          <div className="p-8 space-y-10 animate-in slide-in-from-right pb-32">
            <h2 className="text-4xl font-serif italic text-red-500 text-center">Lolong Rewards</h2>
            <div className="bg-slate-900 p-12 rounded-[3rem] text-center shadow-3xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Saldo Koin</p>
              <h3 className="text-8xl font-black text-white">{user.coins}</h3>
            </div>
            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-black text-base text-white">Daily Check-in</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">+50 Koin Gratis</p>
              </div>
              <button 
                disabled={user.lastCheckIn === new Date().toISOString().split('T')[0] || isCheckingIP} 
                onClick={claimDailyReward}
                className="bg-red-600 px-8 py-3 rounded-2xl text-[10px] font-black text-white uppercase active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
              >
                {isCheckingIP ? 'VERIFY...' : 'KLAIM'}
              </button>
            </div>
          </div>
        )}

        {activePage === 'PROFILE' && (
          <div className="p-8 space-y-10 animate-in slide-in-from-left pb-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-tr from-red-600 to-amber-600 p-1.5 shadow-2xl">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover rounded-[2.8rem] bg-slate-950" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-serif italic text-white flex items-center justify-center gap-3">
                  {user.name} 
                  <button onClick={openRenameModal} className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">✏️</button>
                </h2>
                <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">Elite Member</p>
              </div>
            </div>

            <div className="space-y-3 pt-6">
               <button onClick={() => setActiveModal('PURCHASES')} className="w-full p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex justify-between items-center text-white text-xs font-black uppercase tracking-widest">
                  <span>📊 Riwayat Transaksi</span><span>›</span>
               </button>
               <button onClick={() => setActiveModal('SECURITY')} className="w-full p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex justify-between items-center text-white text-xs font-black uppercase tracking-widest">
                  <span>🛡️ Privasi & Data</span><span>›</span>
               </button>
               {!isAdmin && <button onClick={() => setShowLogin(true)} className="w-full mt-10 py-5 text-[10px] font-black text-slate-800/40 hover:text-red-600 transition-all uppercase tracking-[0.5em] text-center">LOLONG ADMIN TERMINAL</button>}
               {isAdmin && (
                 <button onClick={() => setActivePage('ADMIN_DASHBOARD')} className="w-full py-5 bg-red-600 rounded-3xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl shadow-red-600/20">Masuk Panel Admin</button>
               )}
            </div>
          </div>
        )}

        {activePage === 'ADMIN_DASHBOARD' && renderAdminDashboard()}
      </div>

      {activePage !== 'WATCH' && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-sm bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] py-4 px-10 flex justify-between items-center z-50 shadow-2xl">
          <button onClick={() => setActivePage('HOME')} className={`flex flex-col items-center gap-1.5 ${activePage === 'HOME' ? 'text-red-500 scale-110' : 'text-slate-600'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
             <span className="text-[7px] font-black uppercase">Beranda</span>
          </button>
          <button onClick={() => setActivePage('REWARDS')} className={`flex flex-col items-center gap-1.5 ${activePage === 'REWARDS' ? 'text-red-500 scale-110' : 'text-slate-600'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
             <span className="text-[7px] font-black uppercase">Hadiah</span>
          </button>
          <button onClick={() => setActivePage('PROFILE')} className={`flex flex-col items-center gap-1.5 ${activePage === 'PROFILE' ? 'text-red-500 scale-110' : 'text-slate-600'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
             <span className="text-[7px] font-black uppercase">Saya</span>
          </button>
        </nav>
      )}

      {activeModal === 'PURCHASES' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl p-8 animate-in fade-in flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-serif italic text-white">Log Transaksi</h2>
            <button onClick={() => setActiveModal('NONE')} className="text-3xl text-slate-500">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {user.transactions.length === 0 ? <p className="text-center text-slate-600 py-20 uppercase text-[10px] font-black">Belum ada aktivitas.</p> :
              user.transactions.map(tx => (
                <div key={tx.id} className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">{tx.label}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{tx.date}</p>
                  </div>
                  <p className={`text-lg font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {activeModal === 'RENAME' && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="w-full max-w-xs space-y-8 bg-slate-900 p-8 rounded-[3rem] border border-slate-800">
              <div className="text-center">
                 <h2 className="font-serif italic text-white text-3xl mb-2">Ganti Nama</h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase">Identitas Lolong Anda</p>
              </div>
              <div className="space-y-4">
                 <input type="text" className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-red-600 transition-all" value={tempName} onChange={e => setTempName(e.target.value)} />
                 <div className="flex gap-3">
                    <button onClick={() => setActiveModal('NONE')} className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Batal</button>
                    <button onClick={handleSaveName} className="flex-1 bg-red-600 py-4 text-[10px] font-black text-white uppercase tracking-widest rounded-xl">Ganti</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="w-full max-w-xs space-y-12">
              <div className="text-center"><h2 className="font-serif italic text-white text-5xl mb-3">Lolong Admin</h2><p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Authorization</p></div>
              <form onSubmit={handleLogin} className="space-y-6">
                 <input type="text" placeholder="ADMIN USER" className="w-full bg-transparent border-b-2 border-slate-800 p-5 text-white text-xs font-black focus:outline-none focus:border-red-600" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                 <input type="password" placeholder="ADMIN PASS" className="w-full bg-transparent border-b-2 border-slate-800 p-5 text-white text-xs font-black focus:outline-none focus:border-red-600" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowLogin(false)} className="flex-1 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Batal</button>
                    <button type="submit" className="flex-[2] bg-red-600 py-5 text-[10px] font-black text-white uppercase tracking-widest rounded-[2rem] shadow-xl shadow-red-600/20">Masuk</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUpload={(data) => {
          const newDrama: Drama = {
            id: 'd-' + Date.now(), 
            title: data.title || 'Untitled', 
            coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400',
            description: data.description || 'Konten Lolong eksklusif.', 
            genre: data.genre || 'Trending', 
            rating: 9.9, author: user.name, 
            episodes: [{ id: 'e-' + Date.now(), episodeNumber: 1, url: data.url, isLocked: false, coinCost: 0 }]
          };
          setDramas(prev => [newDrama, ...prev]);
          setShowUpload(false);
          alert('BOOM! Konten berhasil mengudara.');
        }} />
      )}
    </div>
  );
};

export default App;
