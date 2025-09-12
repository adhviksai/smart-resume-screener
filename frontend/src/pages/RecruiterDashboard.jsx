import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import JobDescriptionForm from '../components/JobDescriptionForm';
import ResumeUpload from '../components/ResumeUpload';
import RankedResumeList from '../components/RankedResumeList';
import { AuthContext } from '../context/AuthContext';
import { rankResumesAPI } from '../api/resume';

const RecruiterDashboard = () => {
  const [jobDetails, setJobDetails] = useState({ role: '', experience: '', description: '' });
  const [rankedResumes, setRankedResumes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const handleUploadAndRank = async (files) => {
    setError('');
    setIsProcessing(true);
    setRankedResumes([]);
    try {
      const result = await rankResumesAPI(jobDetails, files, token);
      setRankedResumes(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardBaseClasses =
    "w-full bg-white border border-gray-200 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all p-6 relative overflow-hidden";

  const glowEffect =
    "before:absolute before:inset-0 before:rounded-xl before:border before:border-indigo-200 before:bg-transparent before:shadow-[0_0_15px_rgba(99,102,241,0.3)] before:pointer-events-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-8 tracking-tight"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Recruiter Dashboard
        </motion.h1>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-1 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${cardBaseClasses} ${glowEffect}`}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Job Description</h2>
              <JobDescriptionForm
                jobDetails={jobDetails}
                setJobDetails={setJobDetails}
              />
            </div>

            <div className={`${cardBaseClasses} ${glowEffect}`}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Resumes</h2>
              <ResumeUpload
                onUpload={handleUploadAndRank}
                isRecruiter={true}
                isDisabled={jobDetails.role.trim().length < 3}
                isProcessing={isProcessing}
              />
            </div>
          </motion.div>

          <motion.div
            className={`${cardBaseClasses} p-8 ${glowEffect} lg:col-span-2`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Ranked Candidates</h2>
            <RankedResumeList
              rankedResumes={rankedResumes}
              isProcessing={isProcessing}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;

