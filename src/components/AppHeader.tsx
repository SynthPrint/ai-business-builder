import { Link, useLocation } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Compass, Award, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quests", label: "Quests", icon: Compass },
  { to: "/badges", label: "Badges", icon: Award },
  { to: "/insights", label: "Insights", icon: BarChart3 },
] as const;

export function AppHeader() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">AI Automation Quest</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
              Gamify your agency
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
