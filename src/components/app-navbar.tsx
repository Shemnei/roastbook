import { Link, useRouterState } from "@tanstack/react-router"
import type { ComponentType } from "react"
import {
  Coffee,
  Bean,
  Cog,
  MapPin,
  UtensilsCrossed,
  Home,
  Store,
  Plus,
  MoreHorizontal,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type NavItem = {
  title: string
  url: string
  icon: ComponentType<{ className?: string }>
  group?: "log" | "library"
  mobileSlot?: "main" | "more"
  addAction?: boolean
}

const navItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home, mobileSlot: "main" },
  { title: "Shots", url: "/shots", icon: Coffee, group: "log", mobileSlot: "more", addAction: true },
  { title: "Visits", url: "/visits", icon: UtensilsCrossed, group: "log", mobileSlot: "main", addAction: true },
  { title: "Beans", url: "/beans", icon: Bean, group: "library", mobileSlot: "main", addAction: true },
  { title: "Roasters", url: "/roasters", icon: Store, group: "library", mobileSlot: "more" },
  { title: "Gear", url: "/gear", icon: Cog, group: "library", mobileSlot: "more" },
  { title: "Places", url: "/places", icon: MapPin, group: "library", mobileSlot: "more" },
  { title: "Stats", url: "/stats", icon: BarChart3, group: "library", mobileSlot: "more" },
]

const desktopNavGroups = [
  { label: "Log", items: navItems.filter((i) => i.group === "log") },
  { label: "Library", items: navItems.filter((i) => i.group === "library") },
]

const mobileMainNav = navItems.filter((i) => i.mobileSlot === "main")
const mobileMoreItems = navItems.filter((i) => i.mobileSlot === "more")
const addActions = navItems
  .filter((i) => i.addAction)
  .map((i) => ({ ...i, title: `New ${i.title.replace(/s$/, "")}`, url: `${i.url}/new` }))

function MobileNavLink({ item }: { item: NavItem }) {
  return (
    <Link
      to={item.url}
      activeOptions={{ exact: item.url === "/" }}
      className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors flex-1 text-muted-foreground [&.active]:text-primary"
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] font-medium">{item.title}</span>
        </>
      )}
    </Link>
  )
}

function DesktopNavLink({ item }: { item: NavItem }) {
  return (
    <Link
      to={item.url}
      className="relative text-sm transition-colors hover:text-foreground flex items-center gap-1.5 py-1 text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
    >
      {({ isActive }) => (
        <>
          <item.icon className="h-4 w-4" />
          {item.title}
          {isActive && (
            <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </>
      )}
    </Link>
  )
}

function MobileMoreButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMoreActive = mobileMoreItems.some((item) => pathname.startsWith(item.url))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More navigation options"
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors flex-1",
          isMoreActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className="relative">
          <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "stroke-[2.5]")} />
          {isMoreActive && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </div>
        <span className="text-[10px] font-medium">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={12}>
        {mobileMoreItems.map((item) => (
          <DropdownMenuItem key={item.title}>
            <Link
              to={item.url}
              activeProps={{ className: "font-medium" }}
              className="flex items-center gap-2 w-full"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppNavbar() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
        <div className="mx-auto max-w-7xl flex h-14 items-center px-4 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg">
              <img
                src="/roastbook-logo.png"
                alt="Roastbook - home"
                className="size-full object-cover"
              />
            </div>
            <span className="font-semibold hidden lg:inline">Roastbook</span>
          </Link>

          <div className="h-6 w-px bg-border hidden lg:block" />

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="relative text-sm transition-colors hover:text-foreground px-3 py-1 rounded-md hover:bg-muted/50 text-muted-foreground [&.active]:text-foreground [&.active]:font-medium"
            >
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </>
              )}
            </Link>

            {desktopNavGroups.map((group, groupIndex) => (
              <div key={group.label} className="flex items-center">
                {groupIndex > 0 || true ? (
                  <div className="h-4 w-px bg-border mx-2" />
                ) : null}
                <div className="flex items-center gap-1 bg-muted/40 rounded-lg px-1 py-0.5">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium px-2">
                    {group.label}
                  </span>
                  {group.items.map((item) => (
                    <DesktopNavLink key={item.title} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {addActions.map((action) => (
                <DropdownMenuItem key={action.title}>
                  <Link to={action.url} className="flex items-center gap-2 w-full">
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      >
        <div className="flex items-center justify-around h-16 px-1 pb-safe">
          {mobileMainNav.slice(0, 2).map((item) => (
            <MobileNavLink key={item.title} item={item} />
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Create new item"
              className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors flex-1 text-primary"
            >
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center -mt-3 shadow-lg">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-[10px] font-medium">New</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" sideOffset={12}>
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {addActions.map((action) => (
                <DropdownMenuItem key={action.title}>
                  <Link to={action.url} className="flex items-center gap-2 w-full">
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {mobileMainNav.slice(2).map((item) => (
            <MobileNavLink key={item.title} item={item} />
          ))}

          <MobileMoreButton />
        </div>
      </nav>
    </>
  )
}
