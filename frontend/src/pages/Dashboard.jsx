import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ResumeUpload from '../components/ResumeUpload';
import AnalysisDisplay from '../components/AnalysisDisplay';
import TargetRoleForm from '../components/TargetRoleForm';
import { AuthContext } from '../context/AuthContext';
import { uploadResume, analyzeResumeAPI } from '../api/resume';

const Dashboard = () => {
  const [currentResume, setCurrentResume] = useState(null);
  const [analyzedResume, setAnalyzedResume] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const { token } = useContext(AuthContext);

  const handleUpload = async (file) => {
    setError('');
    setIsUploading(true);
    try {
      const result = await uploadResume(file, token);
      setCurrentResume(result.data);
      setAnalyzedResume(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole) return setError('Please specify a Target Role before analyzing.');
    if (!currentResume) return setError('Please upload a resume first.');

    setError('');
    setIsAnalyzing(true);
    setAnalyzedResume(null);
    try {
      const result = await analyzeResumeAPI(currentResume._id, token, { targetRole, targetCompany });
      setAnalyzedResume(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cardBaseClasses =
    "w-full bg-white border border-gray-200 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all p-6 relative overflow-hidden";

  const glowEffect =
    "before:absolute before:inset-0 before:rounded-xl before:border before:border-indigo-200 before:bg-transparent before:shadow-[0_0_15px_rgba(99,102,241,0.3)] before:pointer-events-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto p-6">
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Candidate Dashboard
        </motion.h1>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className={`${cardBaseClasses} ${glowEffect}`}
            >
              <ResumeUpload
                onUpload={handleUpload}
                isRecruiter={false}
                isProcessing={isUploading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className={`${cardBaseClasses} ${glowEffect}`}
            >
              <TargetRoleForm
                targetRole={targetRole}
                setTargetRole={setTargetRole}
                targetCompany={targetCompany}
                setTargetCompany={setTargetCompany}
                onAnalyze={handleAnalyze}
                isResumeUploaded={!!currentResume}
                isAnalyzing={isAnalyzing}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className={`${cardBaseClasses} ${glowEffect}`}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Analysis</h2>
            {isAnalyzing || isUploading ? (
              <div className="text-center py-10">
                <p className="text-indigo-600 font-medium">
                  {isUploading ? 'Uploading...' : 'Analyzing...'}
                </p>
              </div>
            ) : (
              <div>
                <AnalysisDisplay analysis={analyzedResume?.analysis} />
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
