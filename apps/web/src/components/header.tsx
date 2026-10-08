import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export default function Header() {
  const links = [
    { to: "/", label: "Register" },
    { to: "/students", label: "Students" },
  ] as const;

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-5" />
          Student Management
        </Link>
        <nav className="flex gap-4 text-sm">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
