import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import {
  createPost,
  createStudyGroup,
  listCommunityFeed,
  submitChallengeEntry,
} from "@/lib/services/communityService";
import {
  challengeEntrySchema,
  communityPostSchema,
  studyGroupSchema,
} from "@/lib/validators";

export async function GET() {
  await requireUser();
  const community = await listCommunityFeed();
  return NextResponse.json(community);
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    if (action === "group") {
      const input = studyGroupSchema.parse(body);
      const group = await createStudyGroup({ ownerId: session.user.id, ...input });
      return NextResponse.json(group, { status: 201 });
    }

    if (action === "challenge") {
      const input = challengeEntrySchema.parse(body);
      const entry = await submitChallengeEntry({ userId: session.user.id, ...input });
      return NextResponse.json(entry, { status: 201 });
    }

    const input = communityPostSchema.parse(body);
    const post = await createPost({ userId: session.user.id, ...input });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save community item." },
      { status: 400 },
    );
  }
}
