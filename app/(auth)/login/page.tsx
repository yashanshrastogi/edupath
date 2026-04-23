import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { enabledOAuthProviders, getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession().catch(() => null);
  if (session?.user?.id) redirect("/dashboard");
  return <LoginForm oauthProviders={enabledOAuthProviders} />;
}
