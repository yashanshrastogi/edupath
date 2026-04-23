import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";
import { getAuthSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getAuthSession().catch(() => null);
  if (session?.user?.id) redirect("/dashboard");
  return <RegisterForm />;
}
