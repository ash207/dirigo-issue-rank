
import { Link } from "react-router-dom";

export function SiteLogo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="font-bold text-xl">Dirigo</span>
    </Link>
  );
}
