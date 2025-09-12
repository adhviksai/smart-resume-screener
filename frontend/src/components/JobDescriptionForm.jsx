import React from 'react';
import { motion } from 'framer-motion';

const JobDescriptionForm = ({ jobDetails, setJobDetails }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-1 text-gray-800">Define the Job Role</h2>
      <p className="text-gray-600 mb-6">Specify the criteria for the ideal candidate.</p>
      <div className="space-y-5">
        <div>
          <label htmlFor="role" className="text-sm font-bold text-gray-700 block">Job Role</label>
          <input 
            type="text" 
            id="role" 
            name="role"
            value={jobDetails.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
            placeholder="e.g., Senior Frontend Developer"
          />
        </div>
        <div>
          <label htmlFor="experience" className="text-sm font-bold text-gray-700 block">Required Experience (Years)</label>
          <input 
            type="number" 
            id="experience" 
            name="experience"
            value={jobDetails.experience}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-bold text-gray-700 block">Job Description (Optional)</label>
          <textarea 
            id="description" 
            name="description"
            value={jobDetails.description}
            onChange={handleChange}
            rows="6"
            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
            placeholder="Paste the full job description here for the most accurate ranking..."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default JobDescriptionForm;
