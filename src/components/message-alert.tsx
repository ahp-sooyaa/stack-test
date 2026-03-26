import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MessageAlertProps = {
  error?: string;
  success?: string;
};

export function MessageAlert({ error, success }: MessageAlertProps) {
  if (!error && !success) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Action failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>{success}</AlertDescription>
    </Alert>
  );
}
