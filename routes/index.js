   
  const express = require('express');
  const router = express.Router();
  const multer = require('multer');
  const path = require('path');
  const crypto = require('crypto');
  const fs = require('fs');

const fileDatabase = {
  'encryptedFileName123': 'originalFileName.pdf', 
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const hash = crypto.createHash('sha256').update(file.originalname + Date.now()).digest('hex');
    cb(null, hash + ext);
  }
});

// Metadata store (can also use DB)
const metadataFile = './metadata.json';
let metadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile)) : {};


  // Initialize multer with the storage configuration
  const upload = multer({ storage: storage });


   router.get('/', (req, res) => {
      res.render('index', { name: 'test' });
    }); 

      router.get('/about-us', (req, res) => {
      res.render('aboutus', { name: 'test' });
    }); 

    router.get('/features', (req, res) => {
      res.render('features', { name: 'test' });
    }); 




  router.post('/upload', upload.single('file'), (req, res) => {
      if (!req.file) {
          return res.status(400).send('No file uploaded.');
      }

      const file = req.file;
      const encryptedName = file.filename;
      const originalName = file.originalname;
      const uploadDate = new Date().toISOString();

      const newencryption= encryptedName.substring(0, 20).trim();
      // Save metadata
      metadata[newencryption] = { originalName, uploadDate ,encryptedName};
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 3));


      // Generate a URL for accessing the file (shareable link)
      const fileUrlprev = `http://localhost:3000/uploads/${req.file.filename}`;
      const fileUrl = `http://localhost:3000/file/${newencryption}`;
       res.json({
        message: 'File uploaded successfully!',
        fileUrl: fileUrl
      });

  });

  // Download Page
  router.get('/file/:id', (req, res) => {
    const fileId = req.params.id;
    const fileInfo = metadata[fileId];
    if (!fileInfo) {
       return res.redirect('/');
    }
      res.render('view', { fileId: fileId,encryptedFileName: fileInfo.encryptedName,originalName: fileInfo.originalName,uploadate:new Date(fileInfo.uploadDate).toLocaleString()});
  });


  router.get('/download/:fileid', (req, res) => {

    const fileId = req.params.fileid;
    const fileInfo = metadata[fileId];
    const filePath = path.join(__dirname, './../uploads', fileInfo.encryptedName);
    const stat = fs.statSync(filePath);
    const totalSize = stat.size;

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': totalSize,
      'Content-Disposition': 'attachment; filename="${fileInfo.encryptedName}"'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    // Auto-delete after stream ends
    readStream.on('end', () => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Delete error:', err);
      });
    });

    if (metadata[req.params.fileid]) {
      delete metadata[req.params.fileid];
      fs.writeFileSync('./metadata.json', JSON.stringify(metadata, null, 2));
    }


  });




  module.exports = router;