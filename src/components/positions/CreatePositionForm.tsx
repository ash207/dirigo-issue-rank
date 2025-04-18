
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePositionFormProps {
  issueId: string;
  onSuccess?: () => void;
}

const CreatePositionForm = ({ issueId, onSuccess }: CreatePositionFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be signed in to create a position");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert the new position
      const { data: positionData, error: positionError } = await supabase
        .from("positions")
        .insert({
          title: values.title,
          content: values.content,
          issue_id: issueId,
          author_id: user.id,
        })
        .select('id')
        .single();
      
      if (positionError) throw positionError;
      
      toast.success("Position created successfully!");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Failed to create position. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Your Position on This Issue</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Summary of your position"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Position</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Explain your viewpoint in detail..."
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Position"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreatePositionForm;
