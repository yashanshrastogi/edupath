import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";
import { CodingStatsPageClient } from "@/components/coding-stats/CodingStatsPageClient";

export default async function CodingStatsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/signout?callbackUrl=/login");
  }

  return (
    <CodingStatsPageClient
      initialLeetCodeUsername={user.leetcodeUsername ?? null}
      initialCodeforcesHandle={user.codeforcesHandle ?? null}
    />
  );
}

