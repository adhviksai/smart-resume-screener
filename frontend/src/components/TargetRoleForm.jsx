import React from 'react';
import { motion } from 'framer-motion';

const TargetRoleForm = ({ targetRole, setTargetRole, targetCompany, setTargetCompany, onAnalyze, isResumeUploaded, isAnalyzing }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Specify Your Target</h2>
      <p className="text-gray-600 mb-4">Provide a role and company, then click Analyze.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="targetRole" className="text-sm font-bold text-gray-700 block">Target Role</label>
          <input 
            type="text" 
            id="targetRole" 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div>
          <label htmlFor="targetCompany" className="text-sm font-bold text-gray-700 block">Target Company (Optional)</label>
          <input 
            type="text" 
            id="targetCompany" 
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
            placeholder="e.g., Google"
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={onAnalyze}
          disabled={!isResumeUploaded || isAnalyzing}
          className="w-full min-w-[160px] py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
        </button>
        {!isResumeUploaded && <p className="text-xs text-gray-500 mt-2 text-center">Please upload a resume to enable analysis.</p>}
      </div>
    </motion.div>
  );
};

export default TargetRoleForm;
