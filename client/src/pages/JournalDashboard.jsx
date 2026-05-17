import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Tag, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const JournalDashboard = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedAffirmations, setDismissedAffirmations] = useState(() => {
    const saved = localStorage.getItem('dismissed_affirmations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchJournals();
  }, [searchTerm]);

  const fetchJournals = async () => {
    try {
      const endpoint = searchTerm ? `/journals?search=${searchTerm}` : '/journals';
      const { data } = await api.get(endpoint);
      setJournals(data);
    } catch (err) {
      console.error('Error fetching journals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissAffirmation = (id) => {
    const updated = [...dismissedAffirmations, id];
    setDismissedAffirmations(updated);
    localStorage.setItem('dismissed_affirmations', JSON.stringify(updated));
  };

  // Find the most recent affirmation that hasn't been dismissed
  const activeAffirmationJournal = journals.find(j => j.affirmation && j.affirmation.trim() !== '' && !dismissedAffirmations.includes(j._id));
  return (
    <div className="min-h-screen bg-stone dark:bg-obsidian text-obsidian dark:text-stone transition-colors duration-500 p-6 md:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">My Journals</h1>
          <p className="text-sm opacity-60">Private workspace overview</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
            <input 
              type="text" 
              placeholder="Search entries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-obsidian-elevated border border-black/5 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all text-sm"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold opacity-80">Recent Entries</h2>
          <button 
            onClick={() => navigate('/journal/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl shadow-md shadow-terracotta/20 hover:shadow-lg hover:shadow-terracotta/30 transition-all spring-hover font-medium"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>

        {activeAffirmationJournal && (
          <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-terracotta/10 to-amethyst/10 border border-terracotta/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-terracotta font-serif font-bold text-xl flex items-center gap-2">
                <Smile size={20} /> Note from your past self.
              </h3>
              <button 
                onClick={() => handleDismissAffirmation(activeAffirmationJournal._id)}
                className="text-xs font-medium opacity-50 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg"
              >
                Dismiss
              </button>
            </div>
            <p className="text-lg font-sans opacity-90 mt-2 italic">
              "{activeAffirmationJournal.affirmation}"
            </p>
            <p className="text-xs opacity-50 mt-4">
              Written on {new Date(activeAffirmationJournal.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center opacity-50 p-12">Loading entries...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.length === 0 ? (
              <div className="col-span-full text-center p-16 bg-white/30 dark:bg-obsidian-elevated/30 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
                <p className="opacity-50">No journal entries found. Start writing!</p>
              </div>
            ) : (
              journals.map(journal => (
                <div 
                  key={journal._id} 
                  onClick={() => navigate(`/journal/${journal._id}`)}
                  className="bg-white/60 dark:bg-obsidian-elevated/60 backdrop-blur-md p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif font-bold group-hover:text-terracotta transition-colors line-clamp-1">{journal.title}</h3>
                    <span className="text-xs opacity-50 flex items-center gap-1 shrink-0"><CalendarIcon size={12}/> {new Date(journal.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm opacity-60 line-clamp-3 mb-6 font-sans">
                    {journal.content.replace(/<[^>]+>/g, ' ').replace(/[#*`_>]/g, '').trim()} {/* Strip HTML and markdown for preview */}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Smile size={14} className={journal.mood === 'Happy' || journal.mood === 'Productive' ? 'text-green-500' : journal.mood === 'Sad' || journal.mood === 'Angry' ? 'text-red-500' : ''}/> 
                      {journal.mood}
                    </div>
                    {journal.tags && journal.tags.length > 0 && (
                      <div className="flex gap-1">
                        <span className="px-2 py-1 bg-amethyst/10 text-amethyst text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1">
                          <Tag size={10} /> {journal.tags[0]} {journal.tags.length > 1 && `+${journal.tags.length - 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalDashboard;
