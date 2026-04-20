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
        setError("No more variations found!");
      }
    } catch (err) {
      setError('Backend connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 font-sans flex flex-col items-center justify-start md:justify-center p-4 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles size={14} /> AI Powered Discovery
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-4">
            Discover<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-lg font-medium opacity-80">
            Personalized recommendations for your next watch.
          </p>
        </header>

        {/* SEARCH BAR - THE FIX IS HERE */}
        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-2 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)] mb-8">
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            
            {/* Mode Select */}
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              className="bg-slate-800/80 border-none p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all md:w-36"
            >
              <option value="movie">Movies</option>
              <option value="series">Series</option>
              <option value="anime">Anime</option>
              <option value="actors">Actors</option>
            </select>

            {/* Input Container with Fixed Icon Positioning */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-20">
                <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              </div>
              <input 
                type="text" 
                placeholder={mode === 'actors' ? "e.g. Nolan, DiCaprio" : "What's on your mind?"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
                className="w-full h-full bg-slate-800/50 border border-white/5 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-slate-600 transition-all relative z-10"
              />
            </div>

            {/* Search Button */}
            <button 
              onClick={handleRecommend} 
              disabled={loading || !query}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Search'}
            </button>
          </div>

          {(mode === 'movie' || mode === 'series') && (
            <div className="px-4 pt-3 pb-1">
              <label className="inline-flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={byLeads} onChange={(e) => setByLeads(e.target.checked)} />
                <div className={`w-4 h-4 rounded border border-slate-700 flex items-center justify-center transition-all ${byLeads ? 'bg-indigo-600 border-indigo-600' : 'group-hover:border-slate-500'}`}>
                  {byLeads && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-[0.2em] font-black">Lead Cast Mode</span>
              </label>
            </div>
          )}
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div className="w-full h-64 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Curating Recommendations...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div 
              key={result.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl mb-12"
            >
              <div className="relative aspect-[3/4] md:aspect-video overflow-hidden">
                <img src={result.poster_url} alt={result.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex gap-2 mb-4">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded-md text-[10px] font-black italic">⭐ {result.rating}</span>
                    <span className="bg-indigo-600 text-white px-2 py-1 rounded-md text-[10px] font-black italic uppercase tracking-tighter">{result.release_date}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.8] tracking-tighter mb-2">{result.title}</h2>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-10 font-medium">"{result.overview}"</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"><Bookmark size={14} /> Add to Watchlist</button>
                  <button className="flex-1 py-5 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2"><Share2 size={14} /> Share</button>
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