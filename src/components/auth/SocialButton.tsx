
import React from 'react';
import { Button } from "@/components/ui/button";
import { Provider } from '@supabase/supabase-js';

interface SocialButtonProps {
  provider: Provider;
  label: string;
  icon: React.ReactNode;
  onClick: (provider: Provider) => void;
  isLoading: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({ 
  provider, 
  label, 
  icon, 
  onClick,
  isLoading
}) => {
  return (
    <Button
      variant="outline"
      type="button"
      className="w-full flex items-center justify-center gap-2"
      onClick={() => onClick(provider)}
      disabled={isLoading}
    >
      {icon}
      <span>Continue with {label}</span>
    </Button>
  );
};

export default SocialButton;
