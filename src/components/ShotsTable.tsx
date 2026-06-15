import { useNavigate } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { getShots } from "@/lib/server/shots"

type Shot = Awaited<ReturnType<typeof getShots>>[number]

interface ShotsTableProps {
  shots: Shot[]
  hideBean?: boolean
  hideGear?: boolean
}

export function ShotsTable({ shots, hideBean, hideGear }: ShotsTableProps) {
  const navigate = useNavigate()

  if (shots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No shots recorded yet.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          {!hideBean && <TableHead>Bean</TableHead>}
          <TableHead className="text-right">Dose</TableHead>
          <TableHead className="text-right">Yield</TableHead>
          <TableHead className="text-right">Time</TableHead>
          {!hideGear && <TableHead>Recipe</TableHead>}
          <TableHead className="text-right">Rating</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shots.map((shot) => (
          <TableRow
            key={shot.id}
            className="cursor-pointer"
            onClick={() => navigate({ to: "/shots/$shotId", params: { shotId: String(shot.id) } })}
          >
            <TableCell>
              {new Date(shot.createdAt).toLocaleDateString()}
            </TableCell>
            {!hideBean && (
              <TableCell>{shot.bean?.name || "-"}</TableCell>
            )}
            <TableCell className="text-right">
              {shot.doseGrams ? `${shot.doseGrams}g` : "-"}
            </TableCell>
            <TableCell className="text-right">
              {shot.yieldGrams ? `${shot.yieldGrams}g` : "-"}
            </TableCell>
            <TableCell className="text-right">
              {shot.brewTimeSeconds ? `${shot.brewTimeSeconds}s` : "-"}
            </TableCell>
            {!hideGear && (
              <TableCell>{shot.recipe?.name || "-"}</TableCell>
            )}
            <TableCell className="text-right">
              {shot.rating ? (
                <Badge variant="secondary">{shot.rating}/5</Badge>
              ) : (
                "-"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
