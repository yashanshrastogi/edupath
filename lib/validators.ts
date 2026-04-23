import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/\d/, "Password must include a number"),
});

export const roadmapInputSchema = z.object({
  careerGoal: z.string().min(2).max(120),
  currentSkillLevel: z.string().min(2).max(60),
  knownSkills: z.array(z.string()).min(1),
  learningPace: z.string().min(2).max(80),
  educationLevel: z.string().min(2).max(80),
});

export const userProjectStartSchema = z.object({
  projectId: z.string().cuid(),
  roadmapId: z.string().cuid().optional(),
});

export const resumeSchema = z.object({
  title: z.string().min(2).max(120),
  template: z.string().min(2).max(60),
  data: z.record(z.any()),
});

export const quizSubmissionSchema = z.object({
  skill: z.string().min(2).max(80),
  mode: z.enum(["MANUAL", "RESUME_BASED"]),
  answers: z.array(
    z.object({
      questionId: z.string().cuid(),
      selectedIndex: z.number().int().min(0),
    }),
  ),
});

export const communityPostSchema = z.object({
  type: z.enum(["POST", "QUESTION"]),
  title: z.string().min(4).max(140),
  content: z.string().min(10).max(4000),
  tags: z.array(z.string().min(1).max(24)).max(8),
});

export const studyGroupSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  tags: z.array(z.string().min(1).max(24)).min(1).max(8),
  emoji: z.string().min(1).max(24).default("Study"),
});

export const challengeEntrySchema = z.object({
  challengeId: z.string().cuid(),
  githubUrl: z.string().url(),
  description: z.string().max(2000).optional(),
});

export const applicationSchema = z.object({
  jobId: z.string().cuid(),
  resumeId: z.string().cuid().optional(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  coverLetter: z.string().max(4000).optional(),
  attachmentUrl: z.string().url().optional(),
});

export const resumeParseResultSchema = z.object({
  text: z.string().min(1),
  charCount: z.number().int().positive(),
  truncated: z.boolean(),
});

export const atsEvaluateRequestSchema = z.object({
  title: z.string().min(2).max(120),
  rawText: z.string().min(200).max(30_000),
});

export const atsEvaluateResultSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  grammarScore: z.number().int().min(0).max(100),
  keywordScore: z.number().int().min(0).max(100),
  granularScores: z.object({
    content: z.number().int().min(0).max(100),
    sections: z.number().int().min(0).max(100),
    essentials: z.number().int().min(0).max(100),
    tailoring: z.number().int().min(0).max(100),
  }).optional(),
  checks: z.object({
    parseRate: z.boolean(),
    quantifyingImpact: z.boolean(),
    repetition: z.boolean(),
    spellingGrammar: z.boolean(),
  }).optional(),
  grammarFeedback: z.array(z.string().min(2).max(240)).max(20),
  keywordSuggestions: z.array(z.string().min(1).max(40)).max(40),
  skillSuggestions: z.array(z.string().min(1).max(60)).max(30),
  summary: z.string().min(10).max(800),
  extractedData: z.object({
    name: z.string().optional(),
    headline: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    summary: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experienceHighlights: z.array(z.string()).optional(),
    education: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
  }).passthrough().optional(),
});

export const codingHandlesSchema = z.object({
  leetcodeUsername: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid LeetCode username")
    .optional(),
  codeforcesHandle: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9_.-]+$/, "Invalid Codeforces handle")
    .optional(),
});

export const leetCodeStatsResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  totalSolved: z.number().int().nonnegative(),
  totalQuestions: z.number().int().nonnegative().optional(),
  easySolved: z.number().int().nonnegative().optional(),
  totalEasy: z.number().int().nonnegative().optional(),
  mediumSolved: z.number().int().nonnegative().optional(),
  totalMedium: z.number().int().nonnegative().optional(),
  hardSolved: z.number().int().nonnegative().optional(),
  totalHard: z.number().int().nonnegative().optional(),
  acceptanceRate: z.number().nonnegative(),
  ranking: z.number().int().nonnegative().optional(),
  contributionPoints: z.number().int().nonnegative().optional(),
  reputation: z.number().int().nonnegative().optional(),
});

export const codeforcesUserInfoResponseSchema = z.object({
  status: z.literal("OK"),
  result: z
    .array(
      z.object({
        handle: z.string(),
        rank: z.string().optional(),
        rating: z.number().int().optional(),
        maxRank: z.string().optional(),
        maxRating: z.number().int().optional(),
      }),
    )
    .min(1),
});

export const codeforcesUserStatusResponseSchema = z.object({
  status: z.literal("OK"),
  result: z.array(
    z.object({
      verdict: z.string().optional(),
      problem: z.object({
        contestId: z.number().int().optional(),
        index: z.string().optional(),
        name: z.string().optional(),
      }),
    }),
  ),
});
