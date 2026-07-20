import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectEditor } from "@/components/project-editor";
import { getCurrentAccount } from "@/lib/current-account";
import { appCreditCost, getProject } from "@/lib/projects";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const current = await getCurrentAccount();
  if (!current) redirect(`/login?returnTo=${encodeURIComponent(`/app/projects/${projectId}`)}`);
  const project = await getProject(current.userId, projectId);
  if (!project) notFound();
  return <ProjectEditor initialProject={project} availableCredits={current.account.credits} estimatedCredits={appCreditCost(project)} />;
}
