
import { Link } from "react-router-dom";

export function MainNav({ className }: { className?: string }) {
  return (
    <div className={className}>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          to="/"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Home
        </Link>
        <Link
          to="/issues"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Issues
        </Link>
        <Link
          to="/about"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          About
        </Link>
      </nav>
    </div>
  );
}
