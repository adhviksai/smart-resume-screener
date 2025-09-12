import React from "react";
import { motion } from "framer-motion";

const AnalysisDisplay = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="text-center text-gray-500 italic p-6 bg-white shadow-md rounded-lg">
        <p>
          Your analysis will appear here once you provide a target role and upload a resume.
        </p>
      </div>
    );
  }

  const { resumeScore = 0, skillGap, suggestions, smartSummary, jobMatchAnalysis } = analysis;

  const getBarColor = (value) => {
    if (value < 50) return "bg-red-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Job Match Analysis */}
      {jobMatchAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Job Match Analysis</h3>
          <div className="w-full bg-gray-200 rounded-full h-6 mt-2 overflow-hidden">
            <motion.div
              className={`h-6 rounded-full text-sm font-bold text-white flex items-center justify-center ${getBarColor(jobMatchAnalysis.matchPercentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${jobMatchAnalysis.matchPercentage}%` }}
              transition={{ duration: 1 }}
            >
              {jobMatchAnalysis.matchPercentage > 10 &&
                `${jobMatchAnalysis.matchPercentage}% Match`}
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-semibold text-green-700">Pros</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                {jobMatchAnalysis.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700">Cons</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                {jobMatchAnalysis.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* General Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800">General Analysis</h3>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">Smart Summary</h4>
            <p className="text-gray-600 mt-1">{smartSummary || "Not available."}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Skill Gaps</h4>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              {skillGap?.length > 0
                ? skillGap.map((skill, index) => <li key={index}>{skill}</li>)
                : <li>No skill gaps identified.</li>}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Improvement Suggestions</h4>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
              {suggestions?.length > 0
                ? suggestions.map((s, i) => <li key={i}>{s}</li>)
                : <li>No suggestions available.</li>}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDisplay;
