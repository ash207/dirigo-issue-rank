import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MainNav } from "@/components/layout/MainNav";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <SiteLogo />
        <MainNav className="mx-6" />
        
        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
          <nav className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.email || "Avatar"} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="absolute right-0 mt-2 w-40">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/email-signin"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "px-4"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/email-signup"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-dirigo-blue hover:bg-dirigo-blue/90 px-4"
                  )}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
