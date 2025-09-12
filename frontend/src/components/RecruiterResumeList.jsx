// frontend/src/components/RecruiterResumeList.jsx (No changes, included for context)

import React from 'react';

const RecruiterResumeList = ({ resumes, onSelectResume, analyzingId }) => {
  if (!resumes || resumes.length === 0) {
    return <p className="text-gray-500 mt-4">No resumes uploaded yet.</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Uploaded Resumes</h3>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {resumes.map((resume) => (
            <li key={resume._id} className="px-6 py-4 flex items-center justify-between">
              <span className="text-gray-800 font-medium">{resume.fileName}</span>
              {analyzingId === resume._id ? (
                <span className="text-sm text-blue-600">Analyzing...</span>
              ) : (
                <button 
                  onClick={() => onSelectResume(resume)}
                  className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-600 transition duration-300"
                >
                  {resume.analysis ? 'View Analysis' : 'Analyze Resume'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecruiterResumeList;