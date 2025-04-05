
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { EmailFormValues } from "./EmailForm";

interface EmailRecipientFieldProps {
  control: Control<EmailFormValues>;
}

const EmailRecipientField = ({ control }: EmailRecipientFieldProps) => {
  return (
    <FormField
      control={control}
      name="recipient"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Recipient Email</FormLabel>
          <FormControl>
            <Input placeholder="user@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailRecipientField;
