const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const METADATA_FILE = path.join(__dirname, '../metadata.json');

// Load metadata
let metadata = fs.existsSync(METADATA_FILE)
  ? JSON.parse(fs.readFileSync(METADATA_FILE))
  : {};


function setupCronJobs() {

  // cron.schedule('*/10 * * * *', () => {

    const now = Date.now();
    let changed = false;

    for (const fileId in metadata) {

      const fileInfo = metadata[fileId];
      if(fileInfo) {
          const filePath = path.join(UPLOAD_DIR, fileInfo.encryptedName);
          const uploadTime = new Date(metadata[fileId].uploadDate).getTime();

          if ((now - uploadTime) > 24 * 60 * 60 * 1000) {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted: ${fileId}`);
            }

            delete metadata[fileId];
            changed = true;
          }
        }
      }

    if (changed) {
      fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
      console.log('metadata.json updated.');
    } else {
      console.log('No files older than 24 hours.');
    }
 // });
}






module.exports = setupCronJobs;