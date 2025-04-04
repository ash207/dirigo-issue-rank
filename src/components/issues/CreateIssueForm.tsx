import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Landmark, Flag } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  scope: z.enum(["local", "county", "state", "federal", "international"], {
    required_error: "Please select an issue scope",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORIES = [
  "Economy",
  "Environment",
  "Education",
  "Healthcare",
  "Infrastructure",
  "Social Issues",
  "Technology",
  "Transportation",
  "Other"
];

const CreateIssueForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      scope: "state", // Default to state level
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be signed in to create an issue");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("issues")
        .insert({
          title: values.title,
          description: values.description,
          category: values.category,
          creator_id: user.id,
          scope: values.scope,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      toast.success("Issue created successfully!");
      navigate(`/issues/${data.id}`);
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "local":
        return <Landmark className="h-4 w-4 mr-2" />;
      case "international":
        return <Globe className="h-4 w-4 mr-2" />;
      default:
        return <Flag className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Should the minimum wage be increased to $15/hour nationwide?"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scope</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a scope" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local" className="flex items-center">
                      <div className="flex items-center">
                        <Landmark className="h-4 w-4 mr-2" />
                        Local
                      </div>
                    </SelectItem>
                    <SelectItem value="county" className="flex items-center">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2" />
                        County
                      </div>
                    </SelectItem>
                    <SelectItem value="state" className="flex items-center">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2" />
                        State
                      </div>
                    </SelectItem>
                    <SelectItem value="federal" className="flex items-center">
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 mr-2" />
                        Federal
                      </div>
                    </SelectItem>
                    <SelectItem value="international" className="flex items-center">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        International
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide context about this issue..."
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Issue"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateIssueForm;
