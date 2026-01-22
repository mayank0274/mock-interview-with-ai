'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/http/api';
import { use } from 'react';
import { ChevronLeft } from 'lucide-react';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type ChatMessage = {
  type: 'human' | 'ai';
  content: string;
};

type InterviewResult = {
  communication_score?: number | null;
  technical_score?: number | null;
  clarity_score?: number | null;
  suggestions?: string[] | null;
  chats?: ChatMessage[];
  job_title: string;
  end_time: string;
  status: string;
};

export default function InterviewResultsPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ['interview-results', interviewId],
    queryFn: async () => {
      const res = await api.get<InterviewResult>(
        `/interview/result/${interviewId}`,
      );
      return res.data;
    },
    enabled: !!interviewId,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <SidebarWrapper>
        <Link
          href={'/dashboard/interview'}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Interviews</span>
        </Link>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </SidebarWrapper>
    );
  }

  if (error || !data) {
    return (
      <SidebarWrapper>
        <Link
          href={'/dashboard/interview'}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Interviews</span>
        </Link>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">No results available.</p>
        </div>
      </SidebarWrapper>
    );
  }

  const scores = [
    { name: 'Communication', value: data?.communication_score ?? 0 },
    { name: 'Technical', value: data?.technical_score ?? 0 },
    { name: 'Clarity', value: data?.clarity_score ?? 0 },
  ];

  return (
    <SidebarWrapper>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Link
            href={'/dashboard/interview'}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Interviews</span>
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-foreground">
                {data.job_title}
              </h1>
              <span className="px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {data.status}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(data.end_time), {
                addSuffix: true,
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {scores.map((score) => (
              <div
                key={score.name}
                className="bg-card rounded-lg p-5 space-y-4 border border-border shadow-sm"
              >
                <h3 className="text-sm font-normal text-muted-foreground">
                  {score.name}
                </h3>
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(score.value / 10) * 263.9} 263.9`}
                      className="transition-all duration-1000 text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-foreground">
                      {Math.round((score.value / 10) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Interview conversation
                </h2>
              </div>
              <div className="p-4 space-y-4 h-[550px] overflow-y-auto">
                {data.chats && data.chats.length > 0 ? (
                  data.chats.reverse().map((chat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        {chat.type === 'ai' ? `Interviewer` : 'You'}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground leading-relaxed border border-border">
                        {chat.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-12 text-sm">
                    No conversation available.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  Suggestions
                </h2>
              </div>
              <div className="p-4 h-[550px] overflow-y-auto">
                {data.suggestions && data.suggestions.length > 0 ? (
                  <ul className="space-y-3">
                    {data.suggestions
                      .filter((s) => Boolean(s?.trim()))
                      .map((s, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-foreground leading-relaxed"
                        >
                          <span className="text-primary mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-12 text-sm">
                    No suggestions available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
}
