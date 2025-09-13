const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const RESUME_API_URL = `${API_BASE_URL}/api/resumes`;

export const analyzeResumeAPI = async (file, targetData, token) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetData.role);
  formData.append('targetCompany', targetData.company);

  const response = await fetch(`${RESUME_API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze resume');
  }
  return response.json();
};


export const rankResumesAPI = async (jobDetails, files, token) => {
  const formData = new FormData();
  
  formData.append('role', jobDetails.role);
  formData.append('experience', jobDetails.experience);
  formData.append('description', jobDetails.description);

  files.forEach(file => {
    formData.append('resumes', file);
  });

  const response = await fetch(`${RESUME_API_URL}/rank`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to rank resumes');
  }
  return response.json();
};

