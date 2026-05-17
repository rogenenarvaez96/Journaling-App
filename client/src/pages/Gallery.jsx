import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SERVER_URL } from '../config';

const Gallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const allImages = journals.flatMap(j => j.images || []);
  const currentIndex = selectedImage ? allImages.findIndex(img => img._id === selectedImage._id) : -1;

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) setSelectedImage(allImages[currentIndex - 1]);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < allImages.length - 1) setSelectedImage(allImages[currentIndex + 1]);
  };

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const { data } = await api.get('/journals');
        // Filter only journals that actually have images
        setJournals(data.filter(j => j.images && j.images.length > 0));
      } catch (err) {
        console.error('Error fetching journals for gallery', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJournals();
  }, []);

  return (
    <div className="min-h-screen bg-stone dark:bg-obsidian text-obsidian dark:text-stone transition-colors duration-500 p-6 md:p-12 relative">
      
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">My Gallery</h1>
          <p className="text-sm opacity-60">Your private collection of uploaded memories</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl shadow-sm text-sm font-medium flex items-center gap-2">
            <ImageIcon size={16} className="text-terracotta" /> {journals.reduce((acc, j) => acc + j.images.length, 0)} Items
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="animate-spin text-terracotta" size={32} />
          </div>
        ) : (
          <>
            {journals.length === 0 ? (
              <div className="text-center p-16 bg-white/30 dark:bg-obsidian-elevated/30 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
                <p className="opacity-50">No images attached to any journals yet.</p>
              </div>
            ) : (
              journals.map(journal => (
                <div key={journal._id} className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold text-obsidian dark:text-stone cursor-pointer hover:text-terracotta transition-colors" onClick={() => navigate(`/journal/${journal._id}`)}>
                      {journal.title}
                    </h2>
                    <span className="text-xs opacity-50 font-medium tracking-wider uppercase">
                      {new Date(journal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x">
                    {journal.images.map(image => (
                      <div 
                        key={image._id} 
                        onClick={() => setSelectedImage(image)}
                        className="group relative w-64 h-64 shrink-0 bg-black/5 dark:bg-white/5 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all snap-start"
                      >
                        <img 
                          src={`${SERVER_URL}/api/images/${image._id}?token=${localStorage.getItem('accessToken')}`} 
                          alt={image.filename} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <p className="text-stone text-xs truncate max-w-full font-medium">{image.filename}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-stone rounded-full transition-colors z-50"
          >
            <X size={24} />
          </button>

          {currentIndex > 0 && (
            <button 
              onClick={handlePrevious}
              className="absolute left-4 md:left-12 p-3 bg-white/10 hover:bg-white/20 text-stone rounded-full transition-colors z-50 shadow-lg"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {currentIndex < allImages.length - 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-4 md:right-12 p-3 bg-white/10 hover:bg-white/20 text-stone rounded-full transition-colors z-50 shadow-lg"
            >
              <ChevronRight size={32} />
            </button>
          )}
          
          <div className="max-w-5xl w-full max-h-full flex flex-col items-center gap-4 relative" onClick={e => e.stopPropagation()}>
            <img 
              src={`${SERVER_URL}/api/images/${selectedImage._id}?token=${localStorage.getItem('accessToken')}`} 
              alt={selectedImage.filename} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300"
            />
            <div className="text-stone text-center">
              <p className="font-medium">{selectedImage.filename}</p>
              <p className="text-xs opacity-50 mt-1">
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB • {currentIndex + 1} of {allImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
