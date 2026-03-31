import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuthSubmitButtonProps = {
  label: string;
  isPending: boolean;
};

export function AuthSubmitButton({ label, isPending }: AuthSubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}
