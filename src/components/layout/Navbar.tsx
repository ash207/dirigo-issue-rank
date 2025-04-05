
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Flag, Users, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          // Check if user has admin role - matching one of the allowed enum values
          setIsAdmin(data.role === "dirigo_admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

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
          {isAuthenticated && (
            <Link to="/reports" className="text-dirigo-white hover:text-opacity-80 flex items-center gap-1">
              <Flag className="h-4 w-4" />
              Reports
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/users" className="text-dirigo-white hover:text-opacity-80 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link to="/admin/dashboard" className="text-dirigo-white hover:text-opacity-80 flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-dirigo-white">
            <Search size={20} />
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
                  <User size={16} className="mr-2" />
                  {user?.email?.split('@')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>User Management</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/sign-in">
                <Button variant="outline" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
                  <User size={16} className="mr-2" /> Sign In
                </Button>
              </Link>
              <Link to="/complete-signup">
                <Button variant="outline" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
