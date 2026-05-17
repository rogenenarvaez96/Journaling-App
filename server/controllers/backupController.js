import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import archiverZipEncrypted from 'archiver-zip-encrypted';
import unzipper from 'unzipper';
import Journal from '../models/Journal.js';
import Image from '../models/Image.js';

archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

export const exportBackup = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required for backup.' });

  try {
    const journals = await Journal.find({ userId: req.user._id }).lean();
    const images = await Image.find({ userId: req.user._id }).lean();

    res.attachment(`journal_backup.zip`);
    
    const archive = archiver.create('zip-encrypted', {
      zlib: { level: 8 },
      encryptionMethod: 'zip20',
      password: password
    });

    archive.on('error', (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    archive.pipe(res);

    archive.append(JSON.stringify({ journals, images }, null, 2), { name: 'journals.json' });

    for (const img of images) {
      const imgPath = path.join(process.cwd(), img.filepath);
      if (fs.existsSync(imgPath)) {
        archive.file(imgPath, { name: `images/${img.filename}` });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("Export backup error:", error);
    if (!res.headersSent) res.status(500).json({ message: 'Backup failed.' });
  }
};

export const importBackup = async (req, res) => {
  const { password, strategy } = req.body; 
  if (!password || !req.file) return res.status(400).json({ message: 'File and password are required.' });

  try {
    const directory = await unzipper.Open.buffer(req.file.buffer);
    
    const manifestFile = directory.files.find(f => f.path === 'journals.json');
    if (!manifestFile) return res.status(400).json({ message: 'Invalid backup format: missing journals.json' });

    let manifestBuffer;
    try {
      manifestBuffer = await manifestFile.buffer(password);
    } catch (e) {
      return res.status(401).json({ message: 'Incorrect password or corrupted backup.' });
    }

    const { journals, images } = JSON.parse(manifestBuffer.toString());

    if (strategy === 'rollback') {
      await Journal.deleteMany({ userId: req.user._id });
    }

    const oldIdToNewIdMap = {};
    for (const oldImg of images) {
      const imgZipFile = directory.files.find(f => f.path === `images/${oldImg.filename}`);
      if (imgZipFile) {
        let imgBuffer;
        try {
          imgBuffer = await imgZipFile.buffer(password);
        } catch (e) {
          continue; // Skip if single file decrypt fails
        }
        
        const newFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(oldImg.filename);
        const userDir = path.join(process.cwd(), 'uploads', req.user._id.toString());
        
        // Ensure user-isolated directory exists
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }

        const absolutePath = path.join(userDir, newFilename);
        fs.writeFileSync(absolutePath, imgBuffer);

        const newFilepath = `/uploads/${req.user._id}/${newFilename}`;

        const newImage = await Image.create({
          userId: req.user._id,
          filename: newFilename,
          filepath: newFilepath,
          mimetype: oldImg.mimetype,
          size: oldImg.size
        });
        
        oldIdToNewIdMap[oldImg._id] = newImage._id;
      }
    }

    for (const oldJ of journals) {
      const newImageIds = (oldJ.images || []).map(oldId => oldIdToNewIdMap[oldId]).filter(Boolean);

      if (strategy === 'merge') {
        const existing = await Journal.findOne({ userId: req.user._id, title: oldJ.title, createdAt: oldJ.createdAt });
        if (existing) {
          if (new Date(existing.updatedAt) >= new Date(oldJ.updatedAt)) {
            continue; 
          } else {
            await Journal.findByIdAndUpdate(existing._id, {
              content: oldJ.content,
              mood: oldJ.mood,
              tags: oldJ.tags,
              affirmation: oldJ.affirmation,
              images: newImageIds,
              updatedAt: oldJ.updatedAt
            });
            continue;
          }
        }
      }

      await Journal.create({
        userId: req.user._id,
        title: oldJ.title,
        content: oldJ.content,
        mood: oldJ.mood,
        affirmation: oldJ.affirmation,
        tags: oldJ.tags,
        images: newImageIds,
        createdAt: oldJ.createdAt,
        updatedAt: oldJ.updatedAt
      });
    }

    res.status(200).json({ message: 'Backup restored successfully!' });
  } catch (error) {
    console.error("Import backup error:", error);
    res.status(500).json({ message: 'Failed to restore backup.' });
  }
};
