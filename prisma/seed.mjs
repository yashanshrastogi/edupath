import bcrypt from "bcryptjs";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123", 12);

  const [admin, user] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@edupath.ai" },
      update: {},
      create: {
        email: "admin@edupath.ai",
        name: "EduPath Admin",
        password,
        role: "ADMIN",
        targetRole: "Platform Admin",
        currentLevel: "Advanced",
      },
    }),
    prisma.user.upsert({
      where: { email: "demo@edupath.ai" },
      update: {},
      create: {
        email: "demo@edupath.ai",
        name: "Demo Learner",
        password,
        role: "USER",
        targetRole: "Full-Stack Developer",
        currentLevel: "Intermediate",
        xp: 1240,
        streak: 14,
        level: 12,
      },
    }),
  ]);

  const projects = [
    {
      title: "Portfolio Website",
      slug: "portfolio-website",
      summary: "A polished personal portfolio with responsive sections and a contact flow.",
      description: "Build a portfolio website that highlights projects, skills, and your professional story.",
      difficulty: "BEGINNER",
      stack: ["HTML", "CSS", "JavaScript"],
      tracks: ["Full-Stack", "Frontend"],
      estimatedHours: 16,
      repoUrl: "https://github.com/bradtraversy/portfolio-project",
      requirements: ["Responsive layout", "Accessible navigation", "Contact form"],
      learningOutcomes: ["Semantic HTML", "Responsive CSS", "Deployment basics"],
      isFeatured: true,
    },
    {
      title: "Job Tracker SaaS",
      slug: "job-tracker-saas",
      summary: "Track applications, interviews, and offer stages with a clean product flow.",
      description: "Create a SaaS-style application for managing job applications and hiring progress.",
      difficulty: "INTERMEDIATE",
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
      tracks: ["Full-Stack", "Backend"],
      estimatedHours: 28,
      repoUrl: "https://github.com/vercel/nextjs-postgres-auth-starter",
      requirements: ["Protected routes", "Kanban tracking", "Search and filters"],
      learningOutcomes: ["Auth patterns", "CRUD architecture", "Database-backed UI"],
      isFeatured: true,
    },
    {
      title: "AI Resume Analyzer",
      slug: "ai-resume-analyzer",
      summary: "Analyze resumes against role requirements and return actionable improvement feedback.",
      description: "Design an AI-assisted resume analyzer with ATS scoring and suggestion workflows.",
      difficulty: "ADVANCED",
      stack: ["Next.js", "OpenAI API", "Prisma"],
      tracks: ["Full-Stack", "AI"],
      estimatedHours: 32,
      repoUrl: "https://github.com/adrianhajdin/ai_image_generation",
      requirements: ["Prompt design", "Structured scoring", "Resume export"],
      learningOutcomes: ["AI integration", "Data modeling", "Workflow UX"],
      isFeatured: false,
    },
    {
      title: "Multi-Agent Research Bot",
      slug: "multi-agent-research-bot",
      summary: "Build an AI agent that browses and summarizes research papers.",
      description: "Use LangChain and OpenAI to build a multi-agent system for academic research.",
      difficulty: "ADVANCED",
      stack: ["Python", "OpenAI", "LangChain"],
      tracks: ["AI", "Research"],
      estimatedHours: 40,
      repoUrl: "https://github.com/langchain-ai/langchain",
      requirements: ["Tool calling", "Memory management", "PDF parsing"],
      learningOutcomes: ["Agentic workflows", "RAG patterns", "Model fine-tuning"],
      isFeatured: true,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }

  const roadmap = await prisma.roadmap.upsert({
    where: { id: "cm-demo-roadmap-0001" },
    update: {},
    create: {
      id: "cm-demo-roadmap-0001",
      userId: user.id,
      title: "Full-Stack Developer Roadmap",
      careerGoal: "Full-Stack Developer",
      currentSkillLevel: "Intermediate",
      knownSkills: ["HTML", "CSS", "JavaScript", "React"],
      learningPace: "Moderate (2-3h/day)",
      educationLevel: "Self-taught / Bootcamp graduate",
      summary: "A production-minded roadmap focused on frontend depth, backend delivery, and portfolio projects.",
      estimatedWeeks: 12,
      modules: {
        create: [
          {
            title: "Frontend Foundations",
            description: "Sharpen UI architecture, accessibility, and component composition.",
            weekStart: 1,
            weekEnd: 2,
            position: 1,
          },
          {
            title: "TypeScript and Data Fetching",
            description: "Build confidence in typed APIs, schema validation, and server data flows.",
            weekStart: 3,
            weekEnd: 5,
            position: 2,
          },
          {
            title: "Backend and Deployment",
            description: "Add authentication, PostgreSQL, Prisma, and deployment-ready patterns.",
            weekStart: 6,
            weekEnd: 9,
            position: 3,
          },
        ],
      },
      milestones: {
        create: [
          {
            title: "Ship portfolio refresh",
            description: "Publish a portfolio that reflects current skills and projects.",
            dueWeek: 3,
          },
          {
            title: "Complete SaaS capstone",
            description: "Build and deploy a full-stack SaaS product.",
            dueWeek: 9,
          },
        ],
      },
    },
  });

  const questions = [
    {
      skill: "JavaScript",
      topic: "Async Patterns",
      mode: "MANUAL",
      difficulty: "INTERMEDIATE",
      prompt: "Which Promise utility resolves with the first fulfilled promise?",
      options: ["Promise.all", "Promise.race", "Promise.any", "Promise.allSettled"],
      correct: 2,
      explanation: "Promise.any resolves when the first promise fulfills and ignores rejections until all fail.",
    },
    {
      skill: "React",
      topic: "Rendering",
      mode: "MANUAL",
      difficulty: "INTERMEDIATE",
      prompt: "Which hook is used to run side effects after render?",
      options: ["useState", "useEffect", "useMemo", "useRef"],
      correct: 1,
      explanation: "useEffect is the standard hook for async work and other side effects.",
    },
    {
      skill: "Resume Review",
      topic: "ATS",
      mode: "RESUME_BASED",
      difficulty: "BEGINNER",
      prompt: "Which change most improves ATS readability?",
      options: ["Tables for all layout", "Keyword-rich plain section headings", "Image-only skills", "Columns everywhere"],
      correct: 1,
      explanation: "Simple section headings and parsable text usually improve ATS extraction quality.",
    },
  ];

  for (const question of questions) {
    await prisma.quizQuestion.create({ data: question });
  }

  await prisma.communityPost.createMany({
    data: [
      {
        userId: user.id,
        type: "POST",
        title: "Shipped my new portfolio",
        content: "I redesigned my portfolio around stronger case studies and metrics. Feedback welcome.",
        tags: ["portfolio", "frontend", "career"],
        upvotes: 18,
      },
      {
        userId: user.id,
        type: "QUESTION",
        title: "How do you explain self-learning on a resume?",
        content: "I spent six months focused on structured upskilling and want to phrase it well.",
        tags: ["resume", "career"],
        upvotes: 11,
        isAnswered: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.studyGroup.create({
    data: {
      ownerId: user.id,
      name: "Full-Stack Builders",
      description: "A focused group for learners building production-grade Next.js and PostgreSQL apps.",
      tags: ["Next.js", "Prisma", "PostgreSQL"],
      emoji: "Code",
      members: {
        create: [{ userId: user.id }, { userId: admin.id }],
      },
    },
  }).catch(() => {});

  const challenge = await prisma.challenge.create({
    data: {
      title: "Ship a Job Tracker in 7 Days",
      description: "Build a polished job tracker with authentication, application stages, and analytics.",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      prize: "$300",
      difficulty: "INTERMEDIATE",
      bannerColor: "#8b5cf6",
    },
  }).catch(() => prisma.challenge.findFirst());

  await prisma.job.createMany({
    data: [
      {
        title: "Frontend Developer",
        company: "Stripe",
        location: "Remote",
        description: "Build high-trust product experiences with React and TypeScript.",
        salaryRange: "$90k-$130k",
        type: "FULL_TIME",
        skills: ["React", "TypeScript", "CSS"],
        sourceUrl: "https://stripe.com/jobs",
        remoteFriendly: true,
      },
      {
        title: "Full-Stack Engineer",
        company: "Vercel",
        location: "Remote / San Francisco",
        description: "Own product features across App Router, APIs, and persistence.",
        salaryRange: "$120k-$170k",
        type: "FULL_TIME",
        skills: ["Next.js", "Node.js", "PostgreSQL"],
        sourceUrl: "https://vercel.com/careers",
        remoteFriendly: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded users, roadmap", roadmap.id, "and challenge", challenge?.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
