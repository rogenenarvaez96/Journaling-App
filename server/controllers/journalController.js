import Journal from "../models/Journal.js";

// @desc    Get all journals for the logged-in user
// @route   GET /api/journals
export const getJournals = async (req, res) => {
  try {
    const { search, mood, archived } = req.query;
    
    // Strict isolation: Ensure users only query their own data
    let query = { userId: req.user._id };

    // Apply optional filters
    if (archived) query.archived = archived === 'true';
    else query.archived = false;

    if (mood) query.mood = mood;

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    const journals = await Journal.find(query)
      .sort({ createdAt: -1 })
      .populate('images');

    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching journals" });
  }
};

// @desc    Get single journal by ID
// @route   GET /api/journals/:id
export const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findOne({ 
      _id: req.params.id,
      userId: req.user._id // Strict isolation
    }).populate('images');

    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching journal" });
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journals
export const createJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, affirmation, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const journal = new Journal({
      userId: req.user._id, // Enforce ownership
      title,
      content,
      mood: mood || 'Neutral',
      tags: tags || [],
      affirmation: affirmation || "",
      images: images || []
    });

    const savedJournal = await journal.save();
    res.status(201).json(savedJournal);
  } catch (error) {
    console.error("Journal Creation Error:", error);
    res.status(500).json({ message: "Error creating journal", error: error.message });
  }
};

// @desc    Update an existing journal entry
// @route   PUT /api/journals/:id
export const updateJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, archived, affirmation, images } = req.body;

    const journal = await Journal.findOne({ 
      _id: req.params.id,
      userId: req.user._id // Strict isolation
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found or unauthorized" });
    }

    journal.title = title || journal.title;
    journal.content = content || journal.content;
    journal.mood = mood || journal.mood;
    journal.tags = tags || journal.tags;
    journal.affirmation = affirmation !== undefined ? affirmation : journal.affirmation;
    journal.archived = archived !== undefined ? archived : journal.archived;
    if (images !== undefined) journal.images = images;

    const updatedJournal = await journal.save();
    res.json(updatedJournal);
  } catch (error) {
    res.status(500).json({ message: "Error updating journal" });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journals/:id
export const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({ 
      _id: req.params.id,
      userId: req.user._id // Strict isolation
    });

    if (!journal) return res.status(404).json({ message: "Journal not found or unauthorized" });

    await journal.deleteOne();
    res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting journal" });
  }
};
