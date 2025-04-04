
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [isOpen, setIsOpen] = useState(false);
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

      // After creating a position, automatically vote for it
      // Check if user has already voted on this issue
      const { data: existingVote } = await supabase
        .from('user_votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('issue_id', issueId)
        .maybeSingle();

      // If no existing vote, add a vote for this position
      if (!existingVote) {
        const { error: voteError } = await supabase
          .from('user_votes')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            position_id: positionData.id,
          });
          
        if (voteError) {
          console.error("Error recording vote:", voteError);
          // Don't throw - position was created successfully, vote is secondary
        }

        // Update position vote count
        await supabase
          .from('positions')
          .update({ votes: 1 })
          .eq('id', positionData.id);
      }
      
      toast.success("Position created successfully!");
      form.reset();
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Failed to create position. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Your Position</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Your Position on This Issue</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      </DialogContent>
    </Dialog>
  );
};

export default CreatePositionForm;
