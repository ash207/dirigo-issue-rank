
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResult = {
  id: string;
  type: "user" | "issue" | "email";
  title: string;
  subtitle?: string;
};

export const SearchDialog = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log("Searching for term:", debouncedSearchTerm);
        
        // Search for issues
        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("id, title, category")
          .or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
          .limit(5);

        if (issuesError) throw issuesError;
        console.log("Issues found:", issuesData?.length || 0);

        // If authenticated, also search for users by name and by email
        let usersData: any[] = [];
        let emailUsers: any[] = [];
        
        if (isAuthenticated && session?.access_token) {
          // Search for users by name
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, name")
            .ilike("name", `%${debouncedSearchTerm}%`)
            .limit(5);

          if (userError) throw userError;
          usersData = userData || [];
          console.log("Users found by name:", usersData.length);
          
          // Search for users by email using the edge function
          try {
            console.log("Searching for users by email");
            const { data: emailUserData, error: emailUserError } = await supabase.functions.invoke(
              "search-users",
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                },
                body: {
                  searchTerm: debouncedSearchTerm
                }
              }
            );
            
            if (emailUserError) {
              console.error("Email search error:", emailUserError);
              throw emailUserError;
            }
            
            emailUsers = emailUserData || [];
            console.log("Users found by email:", emailUsers.length);
          } catch (error) {
            console.error("Error searching users by email:", error);
            toast.error("Error searching by email. Please try again.");
          }
        }

        // Combine results
        const formattedResults: SearchResult[] = [
          ...(issuesData || []).map((issue) => ({
            id: issue.id,
            type: "issue" as const,
            title: issue.title,
            subtitle: `Issue: ${issue.category}`
          })),
          ...usersData.map((user) => ({
            id: user.id,
            type: "user" as const,
            title: user.name || "Unnamed User",
            subtitle: "User Profile"
          })),
          ...emailUsers.map((user) => ({
            id: user.id,
            type: "email" as const,
            title: user.name || "Unnamed User",
            subtitle: user.email
          }))
        ];

        console.log("Total combined results:", formattedResults.length);
        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("An error occurred while searching");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, isAuthenticated, session]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "issue") {
      navigate(`/issues/${result.id}`);
    } else if (result.type === "user" || result.type === "email") {
      navigate(`/profile/${result.id}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for issues, users, and more
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search for issues, users, emails..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading...</div>
              ) : (
                <div className="py-6 text-center text-sm">No results found.</div>
              )}
            </CommandEmpty>
            {results.length > 0 && (
              <>
                {results.some((result) => result.type === "issue") && (
                  <CommandGroup heading="Issues">
                    {results
                      .filter((result) => result.type === "issue")
                      .map((result) => (
                        <CommandItem
                          key={`${result.type}-${result.id}`}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {isAuthenticated && results.some((result) => result.type === "user") && (
                  <CommandGroup heading="Users">
                    {results
                      .filter((result) => result.type === "user")
                      .map((result) => (
                        <CommandItem
                          key={`${result.type}-${result.id}`}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                
                {isAuthenticated && results.some((result) => result.type === "email") && (
                  <CommandGroup heading="Email Search">
                    {results
                      .filter((result) => result.type === "email")
                      .map((result) => (
                        <CommandItem
                          key={`${result.type}-${result.id}`}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
