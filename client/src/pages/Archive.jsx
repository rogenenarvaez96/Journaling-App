import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { RefreshCw, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

const Archive = () => {
  const [archivedJournals, setArchivedJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArchived = async () => {
    try {
      const { data } = await api.get('/journals?archived=true');
      setArchivedJournals(data);
    } catch (err) {
      console.error('Error fetching archived', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.put(`/journals/${id}`, { archived: false });
      setArchivedJournals(prev => prev.filter(j => j._id !== id));
    } catch (err) {
      alert("Failed to restore entry.");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/journals/${id}`);
      setArchivedJournals(prev => prev.filter(j => j._id !== id));
    } catch (err) {
      alert("Failed to delete entry.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Archive</h1>
        <p className="text-sm opacity-60">Restore hidden entries or delete them permanently</p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center"><Loader2 className="animate-spin text-terracotta" size={32} /></div>
      ) : archivedJournals.length === 0 ? (
        <div className="text-center p-16 bg-white/30 dark:bg-obsidian-elevated/30 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
          <p className="opacity-50">Your archive is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedJournals.map(journal => (
            <div key={journal._id} className="bg-white/40 dark:bg-obsidian-elevated/40 p-6 rounded-3xl border border-black/5 dark:border-white/5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold line-clamp-1">{journal.title}</h3>
                <span className="text-xs opacity-50 flex items-center gap-1 shrink-0"><CalendarIcon size={12}/> {new Date(journal.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm opacity-60 line-clamp-2 mb-6">{journal.content.replace(/<[^>]+>/g, ' ').replace(/[#*`_>]/g, '').trim()}</p>
              
              <div className="flex items-center gap-3 border-t border-black/5 dark:border-white/5 pt-4">
                <button 
                  onClick={() => handleRestore(journal._id)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 hover:bg-terracotta hover:text-white rounded-xl transition-colors"
                >
                  <RefreshCw size={14} /> Restore
                </button>
                <button 
                  onClick={() => handlePermanentDelete(journal._id)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;
