const API_URL = 'http://localhost:5001/api/resumes';

export const uploadResume = async (file, token) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload resume');
  }
  return response.json();
};

export const analyzeResumeAPI = async (resumeId, token, targetData) => {
  const response = await fetch(`${API_URL}/analyze/${resumeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(targetData),
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

  const response = await fetch(`${API_URL}/rank`, {
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

export const getResumesForRecruiter = async (token) => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch resumes');
    }
    return response.json();
};

export const deleteResumeAPI = async (resumeId, token) => {
    const response = await fetch(`${API_URL}/${resumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete resume');
    }
    return response.json();
};
