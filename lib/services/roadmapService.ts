import "server-only";

import { prisma } from "@/lib/prisma";
import { getAI } from "@/lib/ai";

type RoadmapInput = {
  userId: string;
  careerGoal: string;
  currentSkillLevel: string;
  knownSkills: string[];
  learningPace: string;
  educationLevel: string;
};

async function buildRoadmapDraft(input: Omit<RoadmapInput, "userId">) {
  const { client, model } = getAI();

  const prompt = `
You are an elite Tech Lead, Curriculum Designer, and Learning Resource Curator.

A user wants to become: ${input.careerGoal}.
Their background: ${input.educationLevel}, skill level: ${input.currentSkillLevel}, known skills: ${input.knownSkills.join(", ")}.
Learning pace: ${input.learningPace}.

════════════════════════════════════════════════
TASK: Generate a realistic, 12-week learning roadmap.
Output RAW JSON ONLY. Zero markdown fences. Zero explanation text.
════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RESOURCE QUALITY RULES — READ CAREFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[VIDEOS — youtubeUrl field]
• Every lesson MUST have 2-3 YouTube videos.
• Use the format: https://www.youtube.com/watch?v=VIDEO_ID
• The VIDEO_ID must be a REAL, well-known video that exists on YouTube.
• NEVER use dQw4w9WgXcQ (that is a Rickroll — it is STRICTLY FORBIDDEN).
• Prefer videos from these proven channels: freeCodeCamp.org, Traversy Media,
  The Net Ninja, Fireship, CS Dojo, Corey Schafer, Sentdex, MIT OpenCourseWare,
  Harkirat Singh, TechWorld with Nana, NetworkChuck, Andrej Karpathy, 3Blue1Brown.
• Examples of REAL video IDs you may use for common topics:
  - Python basics (Corey Schafer): 9T6bFrMIHxw, YYXdXT2l-Gg
  - JavaScript (Traversy Media): hdI2bqOjy3c, W6NZfCO5SIk
  - Machine Learning (freeCodeCamp): NWONeJKn6kc, i_LwzRVP7bg
  - Neural Networks (3Blue1Brown): aircAruvnKk, Ilg3gGewQ5U
  - React (The Net Ninja): j942wKiXFu8, SqcY0GlETPk
  - Node.js (The Net Ninja): ENrzD9HAZK4
  - Git (Traversy Media): SWYqp7iY_Tc
  - Linux (freeCodeCamp): ROjZy1WbCIA
  - SQL (freeCodeCamp): HXV3zeQKqGY
  - Docker (TechWorld with Nana): 3c-iBn73dDE
  - TypeScript (Fireship): d56mG7DezGs
  - Data Structures (freeCodeCamp): RBSGKlAvoiM
• If you don't know the real ID for a niche topic, use a closely related known video
  rather than making up a random ID.

[ARTICLES — articles field]
• Every lesson MUST have 2-3 articles.
• Only use URLs from these trusted domains:
  developer.mozilla.org, javascript.info, docs.python.org, web.dev,
  freecodecamp.org/news, dev.to, css-tricks.com, medium.com,
  towardsdatascience.com, realpython.com, learnpython.org,
  docs.microsoft.com, cloud.google.com/learn, aws.amazon.com/getting-started,
  kaggle.com/learn, roadmap.sh
• The article URL must be to a REAL page on one of these domains.
  Example: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
  NOT just https://developer.mozilla.org (the root domain is too generic).
• Set "source" to the domain name (e.g. "MDN", "FreeCodeCamp", "RealPython").

[CERTIFICATIONS — module-level certifications array]
• Every module MUST have 3-4 FREE certification or free-audit-mode course links.
• Only use these FREE platforms:
  - https://www.freecodecamp.org/learn (specific certification path)
  - https://www.kaggle.com/learn (specific course path)
  - https://learn.microsoft.com/en-us/training (specific learning path)
  - https://developers.google.com/learn/pathways (specific pathway)
  - https://courses.edx.org/ (audit mode — link to the specific course)
  - https://www.coursera.org/ (audit mode — link to the specific course)
  - https://www.greatlearning.in/academy (specific course)
  - https://www.simplilearn.com/free-online-courses (specific course)
• courseUrl must be a REAL, specific URL — not just the homepage.
• provider must be one of: "freeCodeCamp", "Kaggle Learn", "Microsoft Learn",
  "Google Developers", "edX (Audit)", "Coursera (Audit)", "Great Learning", "Simplilearn"
• certificateName must be the real course/certification name.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON SCHEMA — match this exactly:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "${input.careerGoal} Masterclass",
  "track": "one of: Frontend | Backend | Full-Stack | AI | Data Science | Mobile | General",
  "summary": "1-2 sentence compelling summary.",
  "estimatedWeeks": 12,
  "modules": [
    {
      "title": "Module Title",
      "description": "Rich paragraph describing what this module covers and why it matters.",
      "weekStart": 1,
      "weekEnd": 3,
      "certifications": [
        { "provider": "freeCodeCamp", "courseUrl": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "certificateName": "Scientific Computing with Python" },
        { "provider": "Kaggle Learn", "courseUrl": "https://www.kaggle.com/learn/python", "certificateName": "Python (Kaggle)" },
        { "provider": "Microsoft Learn", "courseUrl": "https://learn.microsoft.com/en-us/training/paths/beginner-python/", "certificateName": "Python for Beginners" }
      ],
      "practiceProblems": [
        { "title": "Problem Title", "description": "Detailed problem description and what skill it tests.", "difficulty": "BEGINNER" }
      ],
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Deep, detailed paragraph explaining this lesson's content, key concepts, and what the learner will be able to do after completing it.",
          "estimatedMins": 60,
          "difficulty": "BEGINNER",
          "videos": [
            { "title": "Real Video Title from Known Channel", "youtubeUrl": "https://www.youtube.com/watch?v=REAL_VIDEO_ID" },
            { "title": "Another Real Video Title", "youtubeUrl": "https://www.youtube.com/watch?v=ANOTHER_REAL_ID" }
          ],
          "articles": [
            { "title": "Real Article Title", "url": "https://developer.mozilla.org/en-US/docs/specific-page", "source": "MDN" },
            { "title": "Another Real Article", "url": "https://realpython.com/specific-tutorial", "source": "RealPython" }
          ]
        }
      ]
    }
  ]
}

RULES SUMMARY:
• Generate exactly 4 modules, each covering a logical week range summing to 12 weeks.
• Each module has at least 3 lessons.
• Each lesson has 2-3 videos and 2-3 articles.
• Each module has 3-4 free certification links.
• NO placeholder URLs. NO dQw4w9WgXcQ. NO made-up video IDs.
• NO generic homepage URLs — every URL must point to a specific page or course.
• Output RAW JSON only. No markdown. No comments in the JSON.
`;

  try {
    const result = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an elite curriculum designer. Respond with raw JSON only — no markdown, no code fences, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    });

    let text = result.choices[0]?.message?.content ?? "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(text);

    // Fallback milestones
    data.milestones = [
      { title: "Ship your first milestone project", description: "Complete and publish a portfolio-ready project.", dueWeek: 3 },
      { title: "Pass a skill verification checkpoint", description: "Take a quiz to validate the current module stack.", dueWeek: 6 },
      { title: "Complete a capstone build", description: "Build an end-to-end project aligned to your career goal.", dueWeek: 12 },
    ];
    return data;
  } catch (err) {
    console.error("AI failed to generate roadmap:", err);
    throw new Error("AI failed to generate curriculum. Try again.");
  }
}

const deepIncludes = {
  modules: {
    orderBy: { position: "asc" as const },
    include: {
      lessons: {
        orderBy: { position: "asc" as const },
        include: { videos: true, articles: true },
      },
      certifications: true,
      practiceProblems: true,
      quizQuestions: true,
    },
  },
  milestones: { orderBy: { dueWeek: "asc" as const } },
};

export async function createRoadmap(input: RoadmapInput) {
  const draft = await buildRoadmapDraft(input);

  return prisma.roadmap.create({
    data: {
      userId: input.userId,
      title: draft.title,
      track: draft.track || "general",
      careerGoal: input.careerGoal,
      currentSkillLevel: input.currentSkillLevel,
      knownSkills: input.knownSkills,
      learningPace: input.learningPace,
      educationLevel: input.educationLevel,
      summary: draft.summary,
      estimatedWeeks: draft.estimatedWeeks,
      modules: {
        create: draft.modules.map((module: any, index: number) => ({
          title: module.title,
          description: module.description,
          weekStart: module.weekStart,
          weekEnd: module.weekEnd,
          position: index + 1,
          certifications: { create: module.certifications },
          practiceProblems: { create: module.practiceProblems },
          lessons: {
            create: module.lessons.map((lesson: any, lIndex: number) => ({
              title: lesson.title,
              content: lesson.content,
              estimatedMins: lesson.estimatedMins,
              difficulty: lesson.difficulty,
              position: lIndex + 1,
              videos: { create: lesson.videos },
              articles: { create: lesson.articles },
            })),
          },
        })),
      },
      milestones: {
        create: draft.milestones.map((milestone: any) => ({
          title: milestone.title,
          description: milestone.description,
          dueWeek: milestone.dueWeek,
        })),
      },
    },
    include: deepIncludes,
  });
}

export async function getRoadmapsForUser(userId: string) {
  return prisma.roadmap.findMany({
    where: { userId },
    include: deepIncludes,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRoadmapById(userId: string, roadmapId: string) {
  return prisma.roadmap.findFirst({
    where: { id: roadmapId, userId },
    include: deepIncludes,
  });
}
