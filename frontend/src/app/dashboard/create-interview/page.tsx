'use client';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/http/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import JobTemplateDialog from '@/components/dashboard/JobTemplateDialog';
import { JOB_TEMPLATES } from '@/constants/jobTemplates';

export const ConfirmStart = ({
  open,
  setIsOpen,
  interviewId,
}: {
  open: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  interviewId: string;
}) => {
  const router = useRouter();

  const { mutate: startInterview, isPending: isStartingInterview } =
    useMutation({
      mutationKey: ['create-interview'],
      mutationFn: async () => {
        const res = await api.patch(`/interview/start/${interviewId}`, {});
        return res.data;
      },
      onSuccess: (data) => {
        router.push(`/interview/${data.interviewId}`);
      },
      onError: (err: { errorMsg: string; statusCode: number }) => {
        toast(err.errorMsg);
      },
    });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(val) => {
        setIsOpen(val);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Clicking Start will start your interview and it cannot be
            pasued/retaken after it. You can also start it later from Past
            Interview page
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              startInterview();
            }}
          >
            {isStartingInterview ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Start'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function Page() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [interviewData, setInterviewData] = useState({
    jobTitle: '',
    jobDescription: '',
    interviewType: 'technical',
  });
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleTemplateSelect = (template: (typeof JOB_TEMPLATES)[0]) => {
    setInterviewData({
      ...interviewData,
      jobTitle: template.title,
      jobDescription: template.description,
      interviewType: template.type,
    });
  };

  const {
    mutate: createInterviewSession,
    isPending: isCreatingInterviewSession,
  } = useMutation({
    mutationKey: ['create-interview'],
    mutationFn: async () => {
      const res = await api.post('/interview', {
        job_title: interviewData.jobTitle,
        interview_type: interviewData.interviewType,
        job_description: interviewData.jobDescription,
      });

      return res.data;
    },
    onSuccess: (data) => {
      toast('Interview session created successfully');
      router.push(`/interview/${data.id}`);
      // setIsConfirmDialogOpen(true);
      if (user?.credits_remaining) {
        setUser({ ...user, credits_remaining: user.credits_remaining - 1 });
      }
    },
    onError: (err: { errorMsg: string; statusCode: number }) => {
      toast(err.errorMsg);
    },
  });

  return (
    <SidebarWrapper>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Create an interview
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary font-medium">
                {user?.credits_remaining} interviews left
              </span>
              <Button
                variant="outline"
                className="font-medium px-4 py-2 rounded-md"
              >
                Buy more interviews
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium mb-2">Interview details</h2>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  Give the job details you want to apply for
                </p>
                <Button
                  onClick={() => setTemplateDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 py-1 px-2 flex items-center"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Choose here
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="job-title"
                    className="text-sm font-medium mb-2 block"
                  >
                    Job title
                  </Label>
                  <Input
                    value={interviewData.jobTitle}
                    id="job-title"
                    placeholder="Frontend Developer"
                    className="bg-muted/50 border-input text-foreground h-12 focus-visible:ring-primary"
                    onChange={(e) => {
                      setInterviewData({
                        ...interviewData,
                        jobTitle: e.target.value,
                      });
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label
                      htmlFor="job-description"
                      className="text-sm font-medium"
                    >
                      Paste the job description here
                    </Label>
                  </div>
                  <Textarea
                    value={interviewData.jobDescription}
                    id="job-description"
                    className="bg-muted/50 border-input text-foreground min-h-[200px] resize-none focus-visible:ring-primary"
                    placeholder="e.g. We are seeking a React.js Developer to join our dynamic team in..."
                    onChange={(e) => {
                      setInterviewData({
                        ...interviewData,
                        jobDescription: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <RadioGroup defaultValue="technical">
                <div className="flex items-start space-x-3 p-4 rounded-md border border-border bg-card">
                  <RadioGroupItem
                    value={interviewData.interviewType}
                    id="technical"
                    className="mt-0.5 border-primary text-primary"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="technical"
                      className="text-base font-medium flex items-center gap-2 cursor-pointer"
                    >
                      Technical
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Problem solving
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test your expertise and problem-solving skills
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Button
                disabled={user && user.credits_remaining <= 0 ? true : false}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-md transition-all shadow-md hover:shadow-lg"
                onClick={() => {
                  createInterviewSession();
                }}
              >
                {isCreatingInterviewSession ? (
                  <Loader2 className="w-4 h04 animate-spin" />
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <JobTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelect={handleTemplateSelect}
      />
    </SidebarWrapper>
  );
}
