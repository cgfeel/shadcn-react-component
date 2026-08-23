"use client"

import { IconFolderCode } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/registry/levi/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/levi/components/empty"
import { layouts, variants } from "./_utils"

const link = `/example/login/${layouts[0]}/${variants[0]}`

export default function NotFound() {
  const router = useRouter()
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button
          onClick={() => router.replace(link)}
          onMouseEnter={() => router.prefetch(link)}
        >
          Navigation to Example
          <ArrowUpRightIcon />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
