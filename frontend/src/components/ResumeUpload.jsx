import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResumeUpload = ({ onUpload, isRecruiter = false, isDisabled = false, isProcessing = false }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError(`Please select at least one ${isRecruiter ? 'resume' : 'resume'} to upload.`);
      return;
    }
    onUpload(isRecruiter ? files : files[0]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <h2 className={`text-2xl font-bold mb-4 ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
        {isRecruiter ? 'Upload Resumes' : 'Upload Your Resume'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="resume-upload" className={`block text-sm font-semibold mb-2 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            Select {isRecruiter ? 'one or more files' : 'a single file'} (PDF/DOCX)
          </label>
          <input
            id="resume-upload"
            type="file"
            multiple={isRecruiter}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            accept=".pdf,.docx"
            disabled={isDisabled || isProcessing}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={isDisabled || files.length === 0 || isProcessing}
          className="w-full min-w-[160px] py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
        >
          {isProcessing ? 'Processing...' : (isRecruiter ? `Rank ${files.length || ''} Resumes` : 'Upload Resume')}
        </button>
      </form>
    </motion.div>
  );
};

export default ResumeUpload;
