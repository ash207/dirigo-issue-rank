
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      console.log("Signing out...");
      
      // Call signOut but don't wait for the result since we're forcing navigation anyway
      signOut().catch(error => console.error("Sign out error:", error));
      
      // Force navigation to sign-in page immediately
      navigate('/sign-in');
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out of your account",
        variant: "destructive",
      });
      
      // Still navigate away to sign-in page on error
      navigate('/sign-in');
    } finally {
      setIsSigningOut(false);
    }
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
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/sign-in">
              <Button variant="outline" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
                <User size={16} className="mr-2" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
