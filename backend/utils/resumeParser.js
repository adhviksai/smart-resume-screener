const pdf = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractTextFromBuffer = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        if (mimetype === 'application/pdf') {
            pdf(buffer)
                .then(data => resolve(data.text))
                .catch(err => reject(err));
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            mammoth.extractRawText({ buffer: buffer })
                .then(result => resolve(result.value))
                .catch(err => reject(err));
        } else {
            reject(new Error('Unsupported file type'));
        }
    });
};