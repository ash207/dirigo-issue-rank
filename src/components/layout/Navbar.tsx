
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-dirigo-blue text-white shadow-md py-2">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-dirigo-white">Dirigo</span>
            <span className="text-dirigo-red">Votes</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/issues" className="text-dirigo-white hover:text-opacity-80">
            Issues
          </Link>
          <Link to="/about" className="text-dirigo-white hover:text-opacity-80">
            About
          </Link>
          <Link to="/verify" className="text-dirigo-white hover:text-opacity-80">
            Verification
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-dirigo-white">
            <Search size={20} />
          </Button>
          <Button variant="outline" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
            <User size={16} className="mr-2" /> Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
