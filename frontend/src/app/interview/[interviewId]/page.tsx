'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, SquareStop } from 'lucide-react';
import { useAuth } from '@/context/userContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/http/api';
import { use } from 'react';

const InterviewPage = ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { user } = useAuth();
  const { interviewId } = use(params);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // interview timer

  const {
    data: interview,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async () => {
      const res = await api.get(`/interview/${interviewId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (interview?.rem_duration) {
      // Convert minutes to seconds
      setRemainingTime(interview.rem_duration * 60);
    }
  }, [interview]);

  useEffect(() => {
    if (remainingTime === null) return;
    if (remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const interviewee = {
    id: user?.id || '1',
    name: user?.name || 'Interviewer',
    avatar_url: user?.avatar_url,
    muted: true,
  };
  const interviewer = {
    id: '2',
    name: interview?.interviewer_name || 'Interviewee',
    avatar_url: interview?.interviewer_name || 'Interviewee',
    muted: false,
  };

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [audioUrl, setAudioUrl] = useState('');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream);

      recorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      recorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        chunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.log(err);
    }
  };

  const stopRecording = () => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop();
      setIsRecording(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-white flex items-center justify-center h-screen">
        Loading interview details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 flex items-center justify-center h-screen">
        {(error as { errorMsg: string }).errorMsg}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101114] text-white flex flex-col">
      <div className="flex items-center justify-between bg-[#1D1F23] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
            📡
          </span>
          <span className="font-semibold">
            Job Title : {interview?.job_title}
          </span>
        </div>
        <Button variant="destructive" className="text-white">
          End interview
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-10 px-10 py-8">
        <div className="relative bg-[#222428] rounded-2xl w-[440px] aspect-[4/3] flex flex-col items-center justify-center border-sidebar-primary border-2">
          <Avatar className="w-32 h-32">
            <AvatarFallback className="text-4xl uppercase">
              {interviewee.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="mt-3 text-sm">{interviewee.name}(You)</span>
        </div>
        <div className="relative bg-[#222428] rounded-2xl w-[440px] aspect-[4/3] flex flex-col items-center opacity-70 justify-center">
          <Avatar className="w-40 h-40">
            <AvatarImage src={interviewer.avatar_url} />
            <AvatarFallback className="text-4xl uppercase">
              {interviewer.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="mt-3 text-sm">{interviewer.name}</span>
          {interviewer.muted && (
            <div className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-md">
              <MicOff className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span>
          {remainingTime !== null
            ? formatTime(remainingTime)
            : `${interview?.rem_duration}:00`}
        </span>

        <div className="flex gap-3">
          {isRecording ? (
            <Button
              onClick={stopRecording}
              className="relative flex items-center gap-2 px-6 py-3 text-lg shadow-md rounded-full transition-all bg-green-500 text-black hover:bg-green-600 animate-pulse"
            >
              <SquareStop size={28} color="red" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 text-lg shadow-md rounded-full transition-all bg-green-500 text-black hover:bg-green-600"
            >
              <Mic size={28} />
              Start Speaking
            </Button>
          )}
          {audioUrl && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Preview:</h3>
              <audio controls src={audioUrl}></audio>
            </div>
          )}
        </div>
        <div className="opacity-50 text-lg">ⓘ</div>
      </div>
    </div>
  );
};

export default InterviewPage;
