
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { EmailFormValues } from "./EmailForm";

interface EmailContentFieldProps {
  control: Control<EmailFormValues>;
}

const EmailContentField = ({ control }: EmailContentFieldProps) => {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email Content (HTML)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="<p>Enter your email content here...</p>" 
              className="min-h-[200px] font-mono text-sm"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            You can use HTML tags to format your email.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailContentField;
