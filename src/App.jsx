import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Search, AlertCircle, Loader2, Bookmark, Share2 } from 'lucide-react';

function App() {
  const [mode, setMode] = useState('movie');
  const [query, setQuery] = useState('');
  const [byLeads, setByLeads] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seenIds, setSeenIds] = useState([]);

  useEffect(() => {
    setSeenIds([]);
    setResult(null);
  }, [query, mode]);

  const handleRecommend = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    let finalQuery = query;
    if (mode === 'actors') finalQuery = query.split(',').map(name => name.trim());

    try {
      const response = await fetch('https://movie-recommender-backend-alpha.vercel.app/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, query: finalQuery, by_leads: byLeads, exclude_ids: seenIds }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setSeenIds(prev => [...prev, data.data.id]);
      } else {
        setError("Aur koi nayi recommendation nahi mili!");
      }
    } catch (err) {
      setError('Backend connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 font-sans flex flex-col items-center justify-start md:justify-center p-4 overflow-x-hidden relative">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl z-10" // Increased max-width for PC split layout
      >
        <header className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
          <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} /> AI Powered Discovery
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-2">Discover<span className="text-indigo-600">.</span></h1>
          <p className="text-slate-400 text-sm md:text-lg font-medium opacity-70">Find your next obsession in seconds.</p>
        </header>

        {/* Search Bar Container */}
        <div className="bg-slate-900/50 border border-white/10 backdrop-blur-3xl p-2 rounded-[2rem] shadow-2xl mb-10 max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-slate-800 border-none p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none md:w-36">
              <option value="movie">Movies</option>
              <option value="series">Series</option>
              <option value="anime">Anime</option>
              <option value="actors">Actors</option>
            </select>
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-20"><Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} /></div>
              <input type="text" placeholder={mode === 'actors' ? "e.g. Nolan, DiCaprio" : "Search something..."} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRecommend()} className="w-full h-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-slate-600 relative z-10 transition-all" />
            </div>
            <button onClick={handleRecommend} disabled={loading || !query} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">{loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Search'}</button>
          </div>
          {(mode === 'movie' || mode === 'series') && (
            <div className="px-4 pt-3 pb-1">
              <label className="inline-flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={byLeads} onChange={(e) => setByLeads(e.target.checked)} />
                <div className={`w-4 h-4 rounded border border-slate-700 flex items-center justify-center transition-all ${byLeads ? 'bg-indigo-600 border-indigo-600' : 'group-hover:border-slate-500'}`}>{byLeads && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-[0.2em] font-black">Lead Cast Mode</span>
              </label>
            </div>
          )}
        </div>

        {/* LOADING STATE - COMPACT */}
        <AnimatePresence>
          {loading && (
            <motion.div className="w-full max-w-2xl mx-auto h-64 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scanning the multiverse...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT AREA - NEW SPLIT LAYOUT */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div 
              key={result.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12 flex flex-col md:flex-row overflow-hidden"
            >
              {/* LEFT SIDE: Full Poster (Un-cut) */}
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto relative overflow-hidden group">
                <img 
                  src={result.poster_url} 
                  alt={result.title} 
                  className="w-full h-full object-cover md:object-contain bg-black/30 transition-transform duration-700 hover:scale-105" // PC par contain aur black bg
                />
                {/* Mobile Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent md:hidden" />
              </div>

              {/* RIGHT SIDE: Details & Buttons */}
              <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center">
                <div className="mb-8 md:mb-12">
                  <div className="flex gap-2 mb-4 md:mb-6">
                    <span className="bg-yellow-500 text-black px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black italic shadow-lg">⭐ IMDb {result.rating}</span>
                    <span className="bg-white/10 backdrop-blur-md px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold text-white uppercase">{result.release_date}</span>
                  </div>
                  <h2 className="text-3xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-6 md:mb-8 drop-shadow-2xl">{result.title}</h2>
                  <p className="text-slate-400 text-sm md:text-lg leading-relaxed font-medium italic opacity-80">
                    "{result.overview}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button className="flex-1 py-4 md:py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Bookmark size={14} /> Add to Watchlist
                  </button>
                  <button className="flex-1 py-4 md:py-5 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2">
                    <Share2 size={14} /> Share Discovery
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
