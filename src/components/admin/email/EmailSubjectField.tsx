
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { EmailFormValues } from "./EmailForm";

interface EmailSubjectFieldProps {
  control: Control<EmailFormValues>;
}

const EmailSubjectField = ({ control }: EmailSubjectFieldProps) => {
  return (
    <FormField
      control={control}
      name="subject"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Subject</FormLabel>
          <FormControl>
            <Input placeholder="Email subject" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailSubjectField;
