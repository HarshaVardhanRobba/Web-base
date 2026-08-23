import { SearchXIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>Workflow not found</EmptyTitle>
          <EmptyDescription>
            This workflow does not exist, or it belongs to another organization.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Back to workflows</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
