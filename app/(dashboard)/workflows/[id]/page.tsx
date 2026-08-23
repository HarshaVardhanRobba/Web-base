import { WorkflowShell } from "@/workflows/components/workflow-shell"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WorkflowShell workflowId={id} />
    </div>
  )
}
