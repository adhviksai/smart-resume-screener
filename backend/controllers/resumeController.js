const multer = require('multer');
const Resume = require('../models/Resume');
const { extractTextFromBuffer } = require('../utils/resumeParser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('File type not supported! Only PDF and DOC/DOCX are allowed.'), false);
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5_000_000 } }).single('resume');
exports.uploadMultiple = multer({ storage, fileFilter, limits: { fileSize: 5_000_000 } }).array('resumes', 10);


const INVALID_ANALYSIS = {
  resumeScore: 0,
  skillGap: [],
  suggestions: ['The uploaded document does not appear to be a resume.'],
  smartSummary: 'Analysis failed: Not a valid resume.',
  jobMatchAnalysis: { matchPercentage: 0, pros: [], cons: ['The uploaded document is not a resume.'] },
};

const INVALID_RANKING = {
  candidateName: 'N/A',
  matchScore: 0,
  keyStrengths: ['N/A'],
  redFlags: ['The uploaded document does not appear to be a professional resume.'],
};

const clamp0to100 = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

const stripToJson = (text) => {
  if (!text) return '';
  let t = String(text).trim();
  t = t.replace(/```(\w+)?/g, '').trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return t.slice(first, last + 1);
  }
  return t;
};

const isLikelyResume = (text) => {
  const reasons = [];
  if (!text || typeof text !== 'string') {
    reasons.push('Empty or unreadable text.');
    return { isValid: false, reasons };
  }

  const raw = text.replace(/\s+/g, ' ').trim();
  const wordCount = raw.split(' ').length;
  if (wordCount < 80) reasons.push('Too few words for a resume.');

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw);
  const hasPhone = /(\+?\d[\d\s().-]{7,})/.test(raw);
  if (!hasEmail && !hasPhone) reasons.push('Missing email/phone contact details.');

  const SECTION_WORDS = [
    'education', 'experience', 'work experience', 'skills', 'projects',
    'summary', 'professional summary', 'certifications', 'achievements', 'objective', 'internship'
  ];
  const hits = SECTION_WORDS.filter(w => raw.toLowerCase().includes(w)).length;
  if (hits < 2) reasons.push('Missing common resume sections.');

  const NOT_RESUME_HINTS = [
    'ticket number', 'pnr', 'boarding time', 'departure', 'arrival',
    'ingredients', 'servings', 'preheat oven', 'receipt', 'subtotal',
    'invoice', 'order number', 'order #'
  ];
  const nonResumeHits = NOT_RESUME_HINTS.filter(w => raw.toLowerCase().includes(w)).length;
  if (nonResumeHits > 0) reasons.push('Looks like a non-resume document (receipt/itinerary/invoice).');

  return { isValid: reasons.length === 0, reasons };
};

const buildGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set. AI calls will fail.');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.15,
      topK: 20,
      topP: 0.8,
    },
  });
  return model;
};

const containsFresherSignal = (role, description) => {
  const joint = `${role || ''} ${description || ''}`.toLowerCase();
  const fresherKeywords = ['fresh', 'fresher', 'entry-level', 'entry level', 'recent graduate', 'graduate', 'junior', 'intern', 'trainee', '0 years', '0 yrs'];
  return fresherKeywords.some(k => joint.includes(k));
};

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a file.' });

  try {
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      originalContent: rawText,
    });
    res.status(201).json({ success: true, message: 'Resume uploaded successfully.', data: resume });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: 'Server error during file processing.' });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    const { targetRole, targetCompany } = req.body;
    if (!targetRole || targetRole.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Target role must be at least 3 characters long.' });
    }

    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });
    if (resume.user.toString() !== req.user.id) return res.status(401).json({ success: false, error: 'User not authorized' });

    const gate = isLikelyResume(resume.originalContent);
    if (!gate.isValid) {
      resume.analysis = INVALID_ANALYSIS;
      await resume.save();
      return res.status(200).json({ success: true, data: resume });
    }

    const model = buildGenAI();

    const prompt = `
You are an expert resume analyzer. Your primary goal is to provide a detailed analysis. Return ONLY a JSON object that strictly matches this schema:

{
  "isResume": "boolean",
  "confidence": "number",       // 0..1 confidence that the document is a resume
  "resumeScore": "number",      // integer 0..100 overall quality score
  "skillGap": "Array<string>",
  "suggestions": "Array<string>",
  "smartSummary": "string",
  "jobMatchAnalysis": {
    "matchPercentage": "number", // integer 0..100
    "pros": "Array<string>",
    "cons": "Array<string>"
  }
}

Rules:
- First, determine if the document appears to be a professional resume.
- If it is NOT a resume, set "isResume": false, and set "resumeScore" and "matchPercentage" to 0. Use the "suggestions" and "cons" fields to explain why (e.g., "The document appears to be an invoice, not a resume.").
- If it IS a resume, set "isResume": true and proceed with the full analysis.
- All numeric fields must be integers. Return no extra fields, no markdown, no commentary.
- Use realistic recruiter judgement.

Context:
- Target Role: "${targetRole}"
- Target Company: "${targetCompany || 'Unspecified'}"

Important hiring bias handling:
- If the job indicates entry-level / fresher, you MUST prioritize candidates with strong academics, relevant projects, and internships. Do NOT favor purely experienced senior-level hires in that case.
- If the job indicates a senior role, penalize lack of leadership and production experience.

Resume text between ---:
---
${resume.originalContent}
---
    `.trim();

    const result = await model.generateContent([prompt]);
    const raw = result?.response?.text() || '';
    const json = stripToJson(raw);

    let analysisResult;
    try {
      analysisResult = JSON.parse(json);
    } catch (e) {
      console.error('JSON parse failed (analyzeResume):', raw);
      throw new Error('AI returned non-JSON or malformed JSON.');
    }

    if (analysisResult.isResume === false) {
        let finalAnalysis = { ...INVALID_ANALYSIS };
        if (Array.isArray(analysisResult.suggestions) && analysisResult.suggestions.length > 0) {
            finalAnalysis.suggestions = analysisResult.suggestions;
        }
        if (analysisResult.jobMatchAnalysis && Array.isArray(analysisResult.jobMatchAnalysis.cons) && analysisResult.jobMatchAnalysis.cons.length > 0) {
            finalAnalysis.jobMatchAnalysis.cons = analysisResult.jobMatchAnalysis.cons;
        }
        resume.analysis = finalAnalysis;
        await resume.save();
        return res.status(200).json({ success: true, data: resume });
    }


    const ja = analysisResult.jobMatchAnalysis || {};
    const safe = {
      resumeScore: clamp0to100(analysisResult.resumeScore),
      skillGap: Array.isArray(analysisResult.skillGap) ? analysisResult.skillGap : [],
      suggestions: Array.isArray(analysisResult.suggestions) ? analysisResult.suggestions : [],
      smartSummary: typeof analysisResult.smartSummary === 'string' ? analysisResult.smartSummary : '',
      jobMatchAnalysis: {
        matchPercentage: clamp0to100(ja.matchPercentage),
        pros: Array.isArray(ja.pros) ? ja.pros : [],
        cons: Array.isArray(ja.cons) ? ja.cons : [],
      },
    };

    if (
      typeof safe.resumeScore !== 'number' ||
      typeof safe.jobMatchAnalysis.matchPercentage !== 'number'
    ) {
      console.error('Invalid AI Response Structure (analyzeResume):', analysisResult);
      throw new Error('AI response missing required numeric fields.');
    }

    resume.analysis = safe;
    await resume.save();
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error(`[Analysis Error] User: ${req.user?.id}, Details:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error during AI analysis. The AI may have returned an unexpected format.',
    });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    console.error('Get Resumes Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.rankResumes = async (req, res) => {
  try {
    const { role, experience, description } = req.body;
    const files = req.files;
    if (!role || !files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'Job role and at least one resume are required.' });
    }

    const preferFreshers = (Number(experience) === 0) || (Number(experience) <= 1) || containsFresherSignal(role, description);

    const model = buildGenAI();
    const rankedCandidates = [];

    for (const file of files) {
      let resumeText = '';
      try {
        resumeText = await extractTextFromBuffer(file.buffer, file.mimetype);
        if (!resumeText || resumeText.trim().length < 50) {
          throw new Error('Failed to extract sufficient text from the resume. The file may be an image, empty, or corrupted.');
        }
      } catch (parseError) {
        console.error(`Failed to parse ${file.originalname}:`, parseError.message);
        rankedCandidates.push({
          fileName: file.originalname,
          candidateName: file.originalname,
          matchScore: 0,
          keyStrengths: ['Parsing failed'],
          redFlags: [parseError.message],
        });
        continue;
      }

      const gate = isLikelyResume(resumeText);
      if (!gate.isValid) {
        rankedCandidates.push({
          fileName: file.originalname,
          ...INVALID_RANKING,
        });
        continue;
      }

      const scoringGuidance = preferFreshers
        ? `THIS IS AN ENTRY-LEVEL / FRESHER ROLE. Favor academics, projects, internships, coursework, and learning potential. Do NOT over-weight years of professional experience. Score candidates highly for relevant projects, clear learning trajectory, internships, strong coursework/GPA, and clear communication of impact.`
        : `This role expects the listed experience (${experience || 'Not specified'}) years. Penalize lack of relevant professional experience for mid/senior roles.`;

      const prompt = `
Return ONLY a JSON object with this exact schema (no markdown, no extra text):

{
  "isResume": "boolean",
  "confidence": "number",      // 0..1
  "candidateName": "string",
  "matchScore": "number",      // integer 0..100
  "keyStrengths": "Array<string>",
  "redFlags": "Array<string>"
}

Scoring policy (be strict like a senior recruiter):
- If isResume=false or confidence<0.9, matchScore=0 and redFlags should explain why.
- For senior roles, irrelevant or purely academic background -> very low score (0–15).
- For entry-level / fresher roles, judge more on projects, internships, coursework, GPA, and internships. Do NOT prefer experienced senior hires when this is a fresher job.

${scoringGuidance}

Job Details:
- Role: ${role}
- Required Experience: ${experience || 'Not specified'} years
- Description: ${description || 'Not specified'}

Document text between ---:
---
${resumeText}
---
      `.trim();

      try {
        const result = await model.generateContent([prompt]);
        const raw = result?.response?.text() || '';
        const json = stripToJson(raw);

        let analysis = {};
        try {
          analysis = JSON.parse(json);
        } catch (e) {
          throw new Error('AI returned non-JSON or malformed JSON.');
        }

        if (!analysis.isResume || Number(analysis.confidence || 0) < 0.9) {
          rankedCandidates.push({ fileName: file.originalname, ...INVALID_RANKING });
          continue;
        }

        const candidateName =
          typeof analysis.candidateName === 'string' && analysis.candidateName.trim().length
            ? analysis.candidateName.trim()
            : file.originalname;

        const safe = {
          candidateName,
          matchScore: clamp0to100(analysis.matchScore),
          keyStrengths: Array.isArray(analysis.keyStrengths) ? analysis.keyStrengths : [],
          redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
        };

        if (typeof safe.matchScore !== 'number') {
          throw new Error('Parsed JSON has an invalid structure for matchScore.');
        }

        if (preferFreshers) {
          const lowerText = (resumeText || '').toLowerCase();
          const projectSignals = ['project', 'github', 'portfolio', 'internship', 'final year', 'gpa', 'cgpa', 'b.tech', 'bsc', 'bs', 'bachelor', 'm.tech', 'master'];
          const found = projectSignals.some(k => lowerText.includes(k));
          if (!found && safe.matchScore > 60) {
            safe.redFlags = safe.redFlags || [];
            safe.redFlags.push('No obvious project/internship/academic evidence for freshers role.');
            safe.matchScore = Math.max(0, safe.matchScore - 25);
          }
        }

        rankedCandidates.push({ fileName: file.originalname, ...safe });
      } catch (error) {
        console.error(`Failed to analyze ${file.originalname}:`, error.message || error);
        rankedCandidates.push({
          fileName: file.originalname,
          candidateName: file.originalname,
          matchScore: 0,
          keyStrengths: ['Analysis failed'],
          redFlags: ['Could not parse AI response or response was invalid.'],
        });
      }

      await new Promise((r) => setTimeout(r, 900));
    }

    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json({ success: true, data: rankedCandidates });
  } catch (error) {
    console.error(`[Ranking Error] User: ${req.user?.id}, Details:`, error);
    res.status(500).json({ success: false, error: 'Server error during resume ranking.' });
  }
};