import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRoasters } from "@/lib/server/roasters"
import { RouteError } from "@/components/route-error"
import { ListPending } from "@/components/route-pending"
import { EmptyState } from "@/components/EmptyState"

export const Route = createFileRoute("/roasters/")({
  loader: () => getRoasters(),
  component: RoastersPage,
  pendingComponent: ListPending,
  errorComponent: ({ error }) => (
    <RouteError error={error} backTo="/" backLabel="Go to dashboard" />
  ),
})

function RoastersPage() {
  const roasters = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Roasters
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Coffee roasters you buy from
          </p>
        </div>
        <Button asChild>
          <Link to="/roasters/new">
            <Plus className="h-4 w-4" />
            Add roaster
          </Link>
        </Button>
      </header>

      {roasters.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No roasters added yet"
          description="Start by adding your favorite coffee roasters"
          actionLabel="Add roaster"
          actionHref="/roasters/new"
        />
      ) : (
        <div className="@container">
          <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
            {roasters.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RoasterCard({ roaster }: { roaster: Awaited<ReturnType<typeof getRoasters>>[number] }) {
  const beanCount = roaster.beans?.length ?? 0

  return (
    <Link to="/roasters/$roasterId" params={{ roasterId: String(roaster.id) }}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base line-clamp-1">{roaster.name}</CardTitle>
            {beanCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {beanCount} bean{beanCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {roaster.location && (
            <p className="text-sm text-muted-foreground">
              {roaster.location}{roaster.country ? `, ${roaster.country}` : ""}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {roaster.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">{roaster.notes}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
