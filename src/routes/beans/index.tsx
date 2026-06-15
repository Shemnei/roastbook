import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus, Bean, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getBeans } from "@/lib/server/beans"
import { RouteError } from "@/components/route-error"
import { ListPending } from "@/components/route-pending"
import { EmptyState } from "@/components/EmptyState"

export const Route = createFileRoute("/beans/")({
  loader: () => getBeans(),
  component: BeansPage,
  pendingComponent: ListPending,
  errorComponent: ({ error }) => (
    <RouteError error={error} backTo="/" backLabel="Go to dashboard" />
  ),
})

function BeansPage() {
  const beans = Route.useLoaderData()

  const activeBeans = beans.filter((b) => !b.isArchived)
  const archivedBeans = beans.filter((b) => b.isArchived)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beans</h1>
          <p className="text-muted-foreground">
            Your coffee bean collection
          </p>
        </div>
        <Button asChild>
          <Link to="/beans/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Beans
          </Link>
        </Button>
      </div>

      {beans.length === 0 ? (
        <EmptyState
          icon={Bean}
          title="No beans added yet"
          description="Start by adding your first bag of coffee"
          actionLabel="Add beans"
          actionHref="/beans/new"
        />
      ) : (
        <>
          {activeBeans.length > 0 && (
            <div className="@container">
              <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
                {activeBeans.map((bean) => (
                  <BeanCard key={bean.id} bean={bean} />
                ))}
              </div>
            </div>
          )}

          {activeBeans.length === 0 && archivedBeans.length > 0 && (
            <p className="text-muted-foreground">No active beans. Check the archived section below.</p>
          )}

          {archivedBeans.length > 0 && (
            <Collapsible className="space-y-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                <ChevronDown className="h-4 w-4 transition-transform group-data-[open]:rotate-180" />
                <span className="text-sm font-medium">
                  Archived ({archivedBeans.length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="@container">
                  <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
                    {archivedBeans.map((bean) => (
                      <BeanCard key={bean.id} bean={bean} />
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  )
}

function BeanCard({ bean }: { bean: Awaited<ReturnType<typeof getBeans>>[number] }) {
  const thumbnail = bean.images.find((img) => img.isThumbnail) ?? bean.images[0]
  const baseUrl = import.meta.env.VITE_STORAGE_URL || "/uploads"

  return (
    <Link to="/beans/$beanId" params={{ beanId: String(bean.id) }}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full overflow-hidden flex flex-row">
        {thumbnail && (
          <div className="w-24 shrink-0 overflow-hidden">
            <img
              src={`${baseUrl}/${thumbnail.storagePath}`}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base line-clamp-1">{bean.name}</CardTitle>
            {bean.roastLevel && (
              <Badge variant="outline" className="capitalize text-xs">
                {bean.roastLevel.replace("_", " ")}
              </Badge>
            )}
          </div>
          {bean.roaster && (
            <p className="text-sm text-muted-foreground">{bean.roaster}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm">
            {bean.origin && (
              <span className="text-muted-foreground">{bean.origin}</span>
            )}
            {bean.process && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{bean.process}</span>
              </>
            )}
          </div>
          {bean.roastDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Roasted {new Date(bean.roastDate).toLocaleDateString()}
            </p>
          )}
        </CardContent>
        </div>
      </Card>
    </Link>
  )
}
