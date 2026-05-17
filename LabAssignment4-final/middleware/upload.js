// middleware/upload.js
// Handles image file uploads using Multer

var multer = require('multer');
var path   = require('path');
var fs     = require('fs');

// Make sure the uploads folder exists
var uploadFolder = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Tell Multer where to save files and what to name them
var storage = multer.diskStorage({

    // Save to public/uploads folder
    destination: function(req, file, cb) {
        cb(null, uploadFolder);
    },

    // Give the file a unique name using timestamp
    filename: function(req, file, cb) {
        var ext      = path.extname(file.originalname);
        var baseName = path.basename(file.originalname, ext);
        var uniqueName = baseName + '-' + Date.now() + ext;
        cb(null, uniqueName);
    }
});

// Only allow image files
var fileFilter = function(req, file, cb) {
    var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);   // accept file
    } else {
        cb(new Error('Only image files are allowed (jpg, png, webp)'));
    }
};

// Create the upload handler (max 5MB)
var upload = multer({
    storage:    storage,
    fileFilter: fileFilter,
    limits:     { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
