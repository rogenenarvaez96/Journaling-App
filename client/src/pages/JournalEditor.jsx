import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import { Save, ArrowLeft, Loader2, Smile, FileText, Image as ImageIcon, Archive } from 'lucide-react';
import { SERVER_URL } from '../config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const MOODS = ['Happy', 'Neutral', 'Sad', 'Angry', 'Productive', 'Tired'];

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const JournalEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/images/upload', formData, {
          headers: { 'Content-Type': undefined }
        });
        return data;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setAttachedImages(prev => [...prev, ...uploadedImages]);
    } catch (err) {
      console.error(err);
      alert("Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleArchive = async () => {
    if (window.confirm("Move this entry to archive?")) {
      try {
        await api.put(`/journals/${id}`, { archived: true });
        navigate('/journal');
      } catch (err) {
        alert("Failed to archive entry");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    noClick: true, // We only want drop, not click-to-upload on the entire text area
    noKeyboard: true,
    disabled: !isEditing
  });

  useEffect(() => {
    if (!isNew) {
      const fetchJournal = async () => {
        try {
          const { data } = await api.get(`/journals/${id}`);
          setTitle(data.title);
          setContent(data.content);
          setMood(data.mood);
          setTags(data.tags);
          setAffirmation(data.affirmation || '');
          setAttachedImages(data.images || []);
          setIsLoading(false);
        } catch (err) {
          alert('Failed to load journal');
          navigate('/journal');
        }
      };
      fetchJournal();
    }
  }, [id, isNew, navigate]);

  // Autosave Draft to LocalStorage logic
  useEffect(() => {
    if (isNew && (title || content || affirmation || attachedImages.length > 0)) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('journal_draft', JSON.stringify({ title, content, mood, tags, affirmation, attachedImages }));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, mood, tags, affirmation, attachedImages, isNew]);

  // Load draft if starting new
  useEffect(() => {
    if (isNew) {
      const draft = localStorage.getItem('journal_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setContent(parsed.content || '');
        setMood(parsed.mood || 'Neutral');
        setTags(parsed.tags || []);
        setAffirmation(parsed.affirmation || '');
        setAttachedImages(parsed.attachedImages || []);
      }
    }
  }, [isNew]);

  const handleSave = async () => {
    if (!title || !content) return;
    setIsSaving(true);
    
    try {
      const payload = { 
        title, 
        content, 
        mood, 
        tags, 
        affirmation,
        images: attachedImages.map(img => img._id)
      };
      if (isNew) {
        await api.post('/journals', payload);
        localStorage.removeItem('journal_draft');
        navigate('/journal');
      } else {
        await api.put(`/journals/${id}`, payload);
        setIsEditing(false); // Go back to view mode after saving an existing entry
      }
    } catch (err) {
      alert("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-terracotta" size={32} /></div>;

  return (
    <div className="min-h-screen bg-stone dark:bg-obsidian transition-colors duration-500 text-obsidian dark:text-stone p-4 md:p-8 flex flex-col">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8">
        <button onClick={() => navigate('/journal')} className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:text-terracotta transition-colors">
          <ArrowLeft size={16} /> Back to Journals
        </button>
        <div className="flex items-center gap-4">
          {lastSaved && <span className="text-xs opacity-50">Saved: {lastSaved.toLocaleTimeString()}</span>}
          
          {!isNew && (
            <button 
              onClick={handleArchive} 
              className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all font-medium text-sm"
              title="Archive Entry"
            >
              <Archive size={16} />
            </button>
          )}

          {isEditing ? (
            <button 
              onClick={handleSave} 
              disabled={isSaving || !title || !content}
              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-md transition-all font-medium text-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Entry
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2 bg-obsidian text-white dark:bg-stone dark:text-obsidian px-5 py-2.5 rounded-xl shadow-md transition-all font-medium text-sm hover:opacity-90"
            >
              <FileText size={16} />
              Edit Entry
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col min-h-[70vh]">
        
        {/* Editor/View Pane (Centered & Distraction Free) */}
        <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-8 flex-1">
          {isEditing ? (
            <input 
              type="text" 
              placeholder="Journal Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-4xl font-serif font-bold outline-none placeholder:opacity-30"
            />
          ) : (
            <h1 className="w-full bg-transparent text-4xl font-serif font-bold outline-none">{title}</h1>
          )}
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
              <Smile size={18} className="ml-2 opacity-50" />
              {isEditing ? (
                <select value={mood} onChange={e => setMood(e.target.value)} className="bg-transparent text-sm py-1 pr-4 outline-none appearance-none font-medium">
                  {MOODS.map(m => <option key={m} value={m} className="dark:bg-obsidian">{m}</option>)}
                </select>
              ) : (
                <span className="text-sm py-1 pr-4 font-medium">{mood}</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {tags.map(t => (
                <span key={t} className="px-3 py-1.5 bg-amethyst/10 text-amethyst text-xs rounded-full flex items-center gap-1 font-medium" onClick={() => isEditing && removeTag(t)}>
                  {t} {isEditing && <span className="cursor-pointer hover:text-black dark:hover:text-white">&times;</span>}
                </span>
              ))}
              {isEditing && (
                <input 
                  type="text" 
                  placeholder="Add tag and press Enter..." 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-sm outline-none w-48 border-b border-dashed border-black/20 dark:border-white/20 focus:border-terracotta py-1"
                />
              )}
            </div>
          </div>

          <div {...getRootProps()} className="relative flex-1 flex flex-col pt-4 border-t border-black/5 dark:border-white/5">
            <input {...getInputProps()} />
            {isDragActive && isEditing && (
              <div className="absolute inset-0 z-10 bg-terracotta/10 border-2 border-dashed border-terracotta rounded-xl flex items-center justify-center backdrop-blur-sm">
                <p className="text-terracotta font-bold text-lg flex items-center gap-2"><ImageIcon /> Drop Image Here</p>
              </div>
            )}
            {isUploading && isEditing && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs text-terracotta bg-terracotta/10 px-4 py-2 rounded-full font-bold shadow-sm">
                <Loader2 size={14} className="animate-spin" /> Uploading Image...
              </div>
            )}
            {isEditing ? (
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={QUILL_MODULES}
                placeholder="Write your thoughts here..."
                className="w-full flex-1 bg-transparent text-lg font-sans outline-none relative z-0 custom-quill min-h-[300px]"
              />
            ) : (
              <div className="w-full flex-1 relative z-0 min-h-[300px] ql-snow custom-quill">
                <div 
                  className="ql-editor !p-0 text-lg font-sans leading-relaxed bg-transparent"
                  dangerouslySetInnerHTML={{ __html: content.includes('<') ? content : content.replace(/\n/g, '<br>') }}
                />
              </div>
            )}
          </div>

          {/* Attached Images UI */}
          {(attachedImages.length > 0 || isEditing) && (
            <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-widest font-bold opacity-50 flex items-center gap-1">
                  <ImageIcon size={12} /> {attachedImages.length > 0 ? "Attached Photos" : "Photos"}
                </label>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={open} 
                    className="text-xs font-bold bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ImageIcon size={12} /> Upload Photo
                  </button>
                )}
              </div>
              
              {attachedImages.length > 0 && (
                <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                  {attachedImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 group">
                      <img src={`${SERVER_URL}/api/images/${img._id}?token=${localStorage.getItem('accessToken')}`} alt={img.filename} className="w-full h-full object-cover" />
                      {isEditing && (
                        <button 
                          onClick={() => setAttachedImages(prev => prev.filter(i => i._id !== img._id))}
                          className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(!isEditing && affirmation) || isEditing ? (
            <div className="pt-4 border-t border-black/5 dark:border-white/5">
              <label className="block text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Affirmation for tomorrow</label>
              {isEditing ? (
                <input 
                  type="text" 
                  placeholder="A goodluck message or reminder for your past self..." 
                  value={affirmation}
                  onChange={(e) => setAffirmation(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 text-sm font-sans px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-terracotta/50 placeholder:opacity-40"
                />
              ) : (
                <div className="w-full bg-black/5 dark:bg-white/5 text-sm font-sans px-4 py-3 rounded-xl opacity-80 italic">
                  "{affirmation}"
                </div>
              )}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default JournalEditor;
