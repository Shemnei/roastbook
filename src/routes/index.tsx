import { createFileRoute, Link } from "@tanstack/react-router"
import { Coffee, Bean, Cog, MapPin, UtensilsCrossed, Plus, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDashboardStats, getRecentShots } from "@/lib/server/stats"
import { RouteError } from "@/components/route-error"
import { RoutePending } from "@/components/route-pending"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [stats, recentShots] = await Promise.all([
      getDashboardStats(),
      getRecentShots({ data: 5 }),
    ])
    return { stats, recentShots }
  },
  component: Dashboard,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
})

function Dashboard() {
  const { stats, recentShots } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your coffee journal
          </p>
        </div>
        <Button asChild>
          <Link to="/shots/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Shot
          </Link>
        </Button>
      </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          title="Total Shots"
          value={String(stats.totalShots)}
          description="espresso shots logged"
          icon={Coffee}
          href="/shots"
        />
        <QuickStatCard
          title="Active Beans"
          value={String(stats.activeBeans)}
          description="bags in rotation"
          icon={Bean}
          href="/beans"
        />
        <QuickStatCard
          title="Gear"
          value={String(stats.gearCount)}
          description="pieces of equipment"
          icon={Cog}
          href="/gear"
        />
        <QuickStatCard
          title="Cafe Visits"
          value={String(stats.cafeVisits)}
          description="coffees out"
          icon={UtensilsCrossed}
          href="/visits"
        />
      </div>

        <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Shots</CardTitle>
          </CardHeader>
          <CardContent>
            {recentShots.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No shots logged yet. Start by logging your first espresso!
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/shots/new">Log your first shot</Link>
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                {recentShots.map((shot) => (
                  <Link
                    key={shot.id}
                    to="/shots/$shotId"
                    params={{ shotId: String(shot.id) }}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {shot.bean?.name ?? "Unknown beans"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shot.doseGrams && shot.yieldGrams
                          ? `${shot.doseGrams}g → ${shot.yieldGrams}g`
                          : "No recipe recorded"}
                        {shot.brewTimeSeconds
                          ? ` · ${Math.floor(shot.brewTimeSeconds / 60)}:${String(shot.brewTimeSeconds % 60).padStart(2, "0")}`
                          : ""}
                      </p>
                    </div>
                    {shot.rating && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        {shot.rating}
                      </div>
                    )}
                  </Link>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link to="/shots">View all shots</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/beans/new">
                <Bean className="mr-2 h-4 w-4" />
                Add new beans
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/gear/new">
                <Cog className="mr-2 h-4 w-4" />
                Add gear
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/places/new">
                <MapPin className="mr-2 h-4 w-4" />
                Add a cafe
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickStatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  return (
    <Link to={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
