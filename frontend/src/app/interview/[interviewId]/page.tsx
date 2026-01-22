/* eslint-disable */

'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mic, MicOff, Repeat, SquareStop } from 'lucide-react';
import { useAuth } from '@/context/userContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/http/api';
import { use } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MicPermissionDialog } from '@/components/MicPermissionDialog';
import { formatTime } from '@/lib/utils';
import {
  InterviewerResponse,
  InterviewMetaData,
  Turn,
} from '@/types/interview.types';

function speakMessage(message: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-IN';
  utterance.rate = 0.7;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

const VoiceIndicator = ({ color = 'green' }: { color?: string }) => (
  <motion.div
    className={cn(
      'absolute bottom-3 right-3 flex gap-0.5 items-end',
      color === 'blue' && 'right-3',
    )}
    initial={{ opacity: 0.8 }}
    animate={{ opacity: [0.8, 1, 0.8] }}
    transition={{ repeat: Infinity, duration: 1 }}
  >
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        className={cn(
          'w-1 rounded-full',
          color === 'blue' ? 'bg-chart-2' : 'bg-primary',
        )}
        animate={{ height: [6, 14, 6] }}
        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.1 }}
      />
    ))}
  </motion.div>
);

const useAnswerEvaluationPolling = (
  interviewId: string,
  audioPath: React.MutableRefObject<string | null>,
  onComplete: (data: any) => void,
  handleEvaluationStatus: (status: string) => void,
) => {
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const isPolling = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
      isPolling.current = false;
    }

    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  const checkEvaluationStatus = useCallback(async () => {
    if (!audioPath.current) {
      stopPolling();
      return;
    }

    try {
      abortController.current = new AbortController();
      const signal = abortController.current.signal;
      const res = await api.get(`/interview/evaluation-status/`, {
        params: {
          interview_id: interviewId,
          audio_path: encodeURIComponent(audioPath.current),
        },
        signal,
      });

      if (res.data.status === 'preparing_result') {
        stopPolling();
        audioPath.current = null;
        window.location.href = `/dashboard/interview/${interviewId}`;
        return;
      } else if (res.data.status === 'evaluation_completed') {
        stopPolling();
        audioPath.current = null;
        onComplete(res.data);
      } else if (res.data.status === 'error') {
        stopPolling();
        audioPath.current = null;
        onComplete('Unable to parse your response , can you  explain again');
      }

      handleEvaluationStatus(res.data.status);
    } catch (error) {
      console.error('Error checking evaluation status:', error);
    } finally {
      abortController.current = null;
    }
  }, [interviewId, audioPath, onComplete, stopPolling]);

  const startPolling = useCallback(() => {
    if (isPolling.current) {
      return;
    }

    if (!audioPath.current) {
      return;
    }

    isPolling.current = true;
    checkEvaluationStatus();

    // Then poll every 2 seconds
    pollingInterval.current = setInterval(() => {
      checkEvaluationStatus();
    }, 3000);
  }, [checkEvaluationStatus, audioPath]);

  return { startPolling, stopPolling, isPolling: isPolling.current };
};

const InterviewPage = ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { user } = useAuth();
  const { interviewId } = use(params);
  const [turn, setTurn] = useState(Turn.INTERVIEWER);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const router = useRouter();
  const audioPath = useRef<string | null>(null);
  const hasInitialized = useRef(false);
  const lastAudioBlob = useRef<Blob | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [showMicDialog, setShowMicDialog] = useState(false);

  // handle evaluation related things
  const handleEvaluationComplete = useCallback((data: any) => {
    if (data.evaluation_payload) {
      const interviewer_res = (data.evaluation_payload as InterviewerResponse)
        .interviewer_res;
      const utterance = speakMessage(interviewer_res.question);

      if (utterance) {
        utterance.onend = () => {
          setTurn(Turn.INTERMEDIATE);
        };
      }
    }
  }, []);

  const [evaluationStatus, setEvaluationStatus] = useState('');

  const handleEvaluationStatus = (status: string) => {
    if (status != evaluationStatus) {
      setEvaluationStatus(() => {
        return status;
      });
    }
  };

  const { startPolling, stopPolling } = useAnswerEvaluationPolling(
    interviewId,
    audioPath,
    handleEvaluationComplete,
    handleEvaluationStatus,
  );

  // handle interview metadata related things

  const {
    data: interviewMetaData,
    isLoading,
    error,
    isSuccess,
    refetch: refetchMetaData,
  } = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async (): Promise<InterviewMetaData> => {
      const res = await api.get(`/interview/${interviewId}`);
      return res.data;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  useEffect(() => {
    if (interviewMetaData && !hasInitialized.current) {
      if (!interviewMetaData.end_time) {
        setShowMicDialog(true);
        return;
      }

      hasInitialized.current = true;
      const endTime = new Date(interviewMetaData.end_time);
      const now = new Date();
      const remainingSeconds = Math.floor(
        (endTime.getTime() - now.getTime()) / 1000,
      );
      setRemainingTime(remainingSeconds);

      setShowMicDialog(false);
      setTurn(Turn.INTERVIEWEE);
      startRecording();
    }
  }, [interviewMetaData]);

  const { mutate: endInterview, isPending: isEndingInterview } = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/interview/end/${interviewId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast(data.message);
      router.push('/dashboard/interview');
    },
    onError: () => {
      toast('Failed to end interview');
    },
  });

  // handle audio recording related things
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [audioUrl, setAudioUrl] = useState('');

  const uploadAudio = async (blob: Blob) => {
    try {
      setUploadFailed(false);

      const formData = new FormData();
      formData.append('file', blob, 'interview.webm');
      formData.append('interview_id', interviewId);

      const uploadAudioRes = await api({
        method: 'POST',
        data: formData,
        url: '/upload',
      });

      if (!uploadAudioRes.data) {
        throw new Error('Upload failed');
      }

      audioPath.current = uploadAudioRes.data.audio_path;
      handleEvaluationStatus('Uploading audio');
      startPolling();
    } catch (error) {
      toast('Audio upload failed. Please retry.');
      setUploadFailed(true);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);
      recorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        lastAudioBlob.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        chunks.current = [];
        stream.getTracks().forEach((track) => track.stop());

        try {
          await uploadAudio(blob);
        } catch (e) {
          console.log(e);
        }
      };

      setTurn(Turn.INTERVIEWEE);
      recorder.current.start();
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop();
      setTurn(Turn.INTERVIEWER);
    }
  };

  if (isLoading) {
    return (
      <div className="text-foreground flex items-center justify-center h-screen">
        Loading interview details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex items-center justify-center h-screen">
        {(error as { errorMsg: string }).errorMsg}
      </div>
    );
  }

  if (!user || !interviewMetaData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center justify-between bg-card px-4 md:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            📡
          </span>
          <span className="font-semibold text-sm md:text-base">
            Job Title: {interviewMetaData.job_title}
          </span>
        </div>
        <Button
          variant="destructive"
          className="hover:bg-destructive/90 transition-colors"
          onClick={() => endInterview()}
          disabled={isEndingInterview}
        >
          {isEndingInterview ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'End interview'
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 md:px-10 py-8">
        <div
          className={cn(
            'relative bg-card rounded-2xl w-full max-w-[440px] aspect-[4/3] flex flex-col items-center justify-center transition-all duration-300 border border-border',
            turn === Turn.INTERVIEWEE && 'ring-4 ring-primary',
          )}
        >
          <Avatar className="w-24 h-24 md:w-32 md:h-32">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-4xl uppercase">
              {user.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="mt-3 text-sm font-medium">{user.name} (You)</span>
          {turn === Turn.INTERVIEWEE && <VoiceIndicator color="green" />}
        </div>

        <div
          className={cn(
            'relative bg-card rounded-2xl w-full max-w-[440px] aspect-[4/3] flex flex-col items-center justify-center transition-all duration-300 border border-border',
            (turn === Turn.INTERVIEWER || turn === Turn.INTERMEDIATE) &&
              'ring-4 ring-chart-2',
          )}
        >
          <Avatar className="w-32 h-32 md:w-40 md:h-40">
            <AvatarImage
              src={
                'https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=1024x1024&w=is&k=20&c=oGqYHhfkz_ifeE6-dID6aM7bLz38C6vQTy1YcbgZfx8='
              }
            />
            <AvatarFallback className="text-4xl uppercase">
              {interviewMetaData.interviewer_name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="mt-3 text-sm font-medium">
            {interviewMetaData.interviewer_name}
          </span>
          {(turn === Turn.INTERVIEWER || turn === Turn.INTERMEDIATE) && (
            <div className="absolute bottom-3 right-3 text-muted-foreground text-sm flex items-center gap-1">
              <span className="italic text-chart-2">{evaluationStatus}</span>
              {evaluationStatus === '' && <VoiceIndicator color="blue" />}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-border">
        <span className="text-lg font-mono text-muted-foreground">
          {remainingTime !== null ? formatTime(remainingTime) : `00:00`}
        </span>

        <div className="flex flex-col items-center gap-3">
          {turn === Turn.INTERVIEWEE ? (
            <Button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 text-lg rounded-full bg-destructive hover:bg-destructive/90 transition-all text-destructive-foreground shadow-lg"
            >
              <SquareStop size={24} />
              Stop
            </Button>
          ) : turn === Turn.INTERMEDIATE ? (
            <>
              <p className="text-muted-foreground mb-2 italic text-sm text-center">
                Click “Start Speaking” to answer.
              </p>
              <Button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 text-lg rounded-full bg-primary hover:bg-primary/90 transition-all text-primary-foreground shadow-lg"
              >
                <Mic size={24} />
                Start Speaking
              </Button>
            </>
          ) : (
            <Button
              disabled
              className="flex items-center gap-2 px-6 py-3 text-lg rounded-full bg-muted text-muted-foreground cursor-not-allowed"
            >
              <MicOff size={24} />
              Waiting for Interviewer...
            </Button>
          )}

          {uploadFailed && (
            <Button
              onClick={async () => {
                if (!lastAudioBlob.current) return;
                await uploadAudio(lastAudioBlob.current);
              }}
              className="flex items-center gap-2 px-6 py-3 text-lg rounded-full bg-primary hover:bg-primary/90 transition-all text-primary-foreground shadow-lg"
            >
              <Repeat size={24} />
              Retry
            </Button>
          )}
        </div>

        <div className="opacity-50 text-lg select-none text-muted-foreground">
          ⓘ
        </div>
      </div>
      <MicPermissionDialog
        open={showMicDialog}
        interviewId={interviewId}
        onInterviewStarted={() => {
          refetchMetaData();
        }}
      />
    </div>
  );
};

export default InterviewPage;
