import { Badge } from "@/components/ui/badge"

const STATUS = {
  draft: { label: "Draft", variant: "sun" },
  published: { label: "Published", variant: "aqua" },
  archived: { label: "Archived", variant: "neutral" },
} as const

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const item = STATUS[status]
  return <Badge variant={item.variant}>{item.label}</Badge>
}
