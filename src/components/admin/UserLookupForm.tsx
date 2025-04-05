
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, UserCheck, User, XCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserInfo {
  email: string;
  role: string;
  status: string;
  exists: boolean;
  id?: string;
  name?: string;
  emailConfirmed?: boolean;
}

const UserLookupForm = () => {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (!session?.access_token) {
      toast.error("You must be signed in to use this feature");
      return;
    }
    
    setIsLoading(true);
    setUserInfo(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("lookup-user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { email }
      });
      
      if (error) throw error;
      
      setUserInfo(data);
      
      if (!data.exists) {
        toast.info("User does not exist in the system");
      }
    } catch (error: any) {
      console.error("Error looking up user:", error);
      toast.error(error.message || "Failed to look up user");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex w-full space-x-2">
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : <><Search className="mr-2 h-4 w-4" /> Lookup</>}
            </Button>
          </div>
        </div>
      </form>
      
      {userInfo && (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{userInfo.email}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {userInfo.exists ? 
                      (userInfo.name || "No name provided") : 
                      "User does not exist"}
                  </span>
                </div>
                
                {userInfo.exists && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">User ID:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{userInfo.id}</code>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Email verified:</span>
                      {userInfo.emailConfirmed ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant="outline" className="capitalize">
                        {userInfo.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge 
                        variant={userInfo.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {userInfo.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              {userInfo.exists ? (
                <UserCheck className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserLookupForm;
