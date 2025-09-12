import React from 'react';

const RankedResumeList = ({ rankedResumes, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Analyzing and ranking candidates...</p>
      </div>
    );
  }

  if (rankedResumes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>After you upload resumes, a ranked list of the best candidates will appear here.</p>
      </div>
    );
  }

  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
    { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
  ];

  return (
    <div className="space-y-4">
      {rankedResumes.map((candidate, index) => {
        const color = colors[index % colors.length];

        return (
          <div key={index} className={`border ${color.border} ${color.bg} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg text-gray-800">{candidate.candidateName || candidate.fileName}</h4>
              <span className={`font-bold text-xl ${color.text}`}>{candidate.matchScore}% Match</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <h5 className="font-semibold text-green-700">Key Strengths</h5>
                <ul className="list-disc list-inside mt-1 text-gray-600">
                  {candidate.keyStrengths.map((strength, i) => <li key={i}>{strength}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-red-700">Red Flags</h5>
                <ul className="list-disc list-inside mt-1 text-gray-600">
                  {candidate.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RankedResumeList;