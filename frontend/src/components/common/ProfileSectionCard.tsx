import { Check, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProfileSectionCardProps {
  title: string
  description?: string
  sectionId: string
  editingSection: string | null
  onEdit: (id: string) => void
  onCancel: () => void
  onSave: () => void
  isSaving?: boolean
  editable?: boolean
  view: React.ReactNode
  edit: React.ReactNode
}

export function ProfileSectionCard({
  title,
  description,
  sectionId,
  editingSection,
  onEdit,
  onCancel,
  onSave,
  isSaving = false,
  editable = true,
  view,
  edit,
}: ProfileSectionCardProps) {
  const isEditing = editingSection === sectionId

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {editable && !isEditing ? (
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onEdit(sectionId)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isEditing ? edit : view}
        {isEditing ? (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              <Check className="size-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
