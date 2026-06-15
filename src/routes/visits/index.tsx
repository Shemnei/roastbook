import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { EmptyState } from "@/components/EmptyState"
import { getCafeVisits } from "@/lib/server/cafe-visits"
import { RouteError } from "@/components/route-error"
import { ListPending } from "@/components/route-pending"

export const Route = createFileRoute("/visits/")({
  loader: () => getCafeVisits(),
  component: VisitsPage,
  pendingComponent: ListPending,
  errorComponent: ({ error }) => (
    <RouteError error={error} backTo="/" backLabel="Go to dashboard" />
  ),
})

function VisitsPage() {
  const visits = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cafe Visits</h1>
          <p className="text-muted-foreground">
            Your coffee experiences out and about
          </p>
        </div>
        <Button asChild>
          <Link to="/visits/new" search={{ placeId: undefined }}>
            <Plus className="mr-2 h-4 w-4" />
            Log Visit
          </Link>
        </Button>
      </div>

      {visits.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No visits logged yet"
          description="Track your cafe visits and coffee experiences"
          actionLabel="Log a visit"
          actionHref="/visits/new"
          actionSearch={{ placeId: undefined }}
        />
      ) : (
        <div className="@container">
          <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
            {visits.map((visit) => (
              <Link key={visit.id} to="/visits/$visitId" params={{ visitId: String(visit.id) }}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base line-clamp-1">
                        {visit.drinkName || "Coffee"}
                      </CardTitle>
                      {visit.rating && (
                        <StarRating value={visit.rating} readOnly sizeClassName="size-4" />
                      )}
                    </div>
                    {visit.place && (
                      <p className="text-sm text-muted-foreground">
                        {visit.place.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {visit.drinkType && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {visit.drinkType}
                      </Badge>
                    )}
                    {visit.bean && (
                      <p className="text-sm text-muted-foreground">Beans: {visit.bean.name}</p>
                    )}
                    {visit.price && (
                      <p className="text-sm text-muted-foreground">
                        {visit.currency || "EUR"} {visit.price}
                      </p>
                    )}
                    {visit.tasteTags && visit.tasteTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {visit.tasteTags.slice(0, 3).map((tt) => (
                          <Badge key={tt.id} variant="outline" className="text-xs">
                            {tt.tasteTag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
