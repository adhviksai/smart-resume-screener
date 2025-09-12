import React from "react";
import { motion } from "framer-motion";

const AnalysisModal = ({ resume, onClose, isAnalyzing, error }) => {
  if (!resume) return null;

  const { analysis } = resume;
  const scoreValue = analysis?.resumeScore || analysis?.atsScore || 0;
  const finalScore = isNaN(parseInt(scoreValue, 10))
    ? 0
    : parseInt(scoreValue, 10);

  const { skillGap, suggestions, smartSummary } = analysis || {};

  const getBarColor = (value) => {
    if (value < 70) return "bg-red-500";
    if (value < 85) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-800">
            Analysis for: {resume.fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {isAnalyzing ? (
            <p className="text-blue-600">Analyzing, please wait...</p>
          ) : !analysis ? (
            <p className="text-gray-500">
              This resume has not been analyzed yet.
            </p>
          ) : (
            <>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Resume Score</h4>
                <div className="w-full bg-gray-200 rounded-full h-5 mt-2 overflow-hidden">
                  <motion.div
                    className={`h-5 rounded-full text-sm font-bold text-white flex items-center justify-center ${getBarColor(finalScore)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${finalScore}%` }}
                    transition={{ duration: 1 }}
                  >
                    {finalScore > 0 && `${finalScore}%`}
                  </motion.div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Smart Summary</h4>
                <p className="text-gray-600 mt-1">{smartSummary || "Not available."}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Skill Gaps</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                  {skillGap?.length > 0
                    ? skillGap.map((s, i) => <li key={i}>{s}</li>)
                    : <li>No skill gaps identified.</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Improvement Suggestions</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                  {suggestions?.length > 0
                    ? suggestions.map((s, i) => <li key={i}>{s}</li>)
                    : <li>No suggestions available.</li>}
                </ul>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisModal;
