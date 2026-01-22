import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/http/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface MicPermissionDialogProps {
  open: boolean;
  interviewId: string;
  onInterviewStarted: () => void;
}

export function MicPermissionDialog({
  open,
  interviewId,
  onInterviewStarted,
}: MicPermissionDialogProps) {
  const router = useRouter();
  const [permissionError, setPermissionError] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const goBack = () => {
    router.push('/dashboard/interview');
  };

  const handleStartInterview = async () => {
    try {
      setIsStarting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await api.patch(`/interview/start/${interviewId}`, {});
      onInterviewStarted();
    } catch (err) {
      setPermissionError(true);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl p-10">
        {!permissionError ? (
          <>
            <DialogHeader className="items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <Mic className="h-12 w-12" />
              </div>
              <DialogTitle className="mt-6 text-2xl">
                Ready to start your interview
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                Once you start, the timer will begin immediately. Please allow
                microphone access to continue.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-8 flex justify-center gap-4">
              <Button variant="secondary" size="lg" onClick={goBack}>
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleStartInterview}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Start Interview'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                <MicOff className="h-12 w-12 text-destructive" />
              </div>
              <DialogTitle className="mt-6 text-2xl">
                Microphone access required
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                We couldn’t access your microphone. Please enable permissions in
                your browser settings or return to your interviews.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-8 flex justify-center gap-4">
              <Button variant="secondary" size="lg" onClick={goBack}>
                Back to Interviews
              </Button>
              <Button size="lg" onClick={handleStartInterview}>
                Try Again
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
