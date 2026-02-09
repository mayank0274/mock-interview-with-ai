'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SidebarWrapper from '@/components/layout/SidebarWrapper';
import { api } from '@/http/api';

type Interview = {
  id: string;
  user_email: string;
  job_title: string;
  job_description: string;
  interview_type: string;
  interviewer_name: string;
  status: string;
  created_at: string;
  end_time: string;
};

export default function InterviewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get('page_no') ?? 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['interviews', page],
    queryFn: async () => {
      const res = await api.get(`/interview?page_no=${page}`);
      return res.data as { results: Interview[]; total: number; limit: number };
    },
  });

  const goToPage = (p: number) =>
    router.push(`/dashboard/interview?page_no=${p}`);

  if (isLoading)
    return (
      <SidebarWrapper>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="rounded-lg border bg-card/70 p-4 space-y-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </SidebarWrapper>
    );

  if (isError)
    return (
      <SidebarWrapper>
        <div className="p-4 text-destructive">
          Failed to load interview history.
        </div>
      </SidebarWrapper>
    );

  const { results = [], total = 0, limit = 0 } = data ?? {};
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <SidebarWrapper>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Interviews</h2>
          <Link href={'/dashboard/create-interview'}>
            <Button>Create Interview</Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-muted/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interviewer</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Interview Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {results?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No interviews found
                  </TableCell>
                </TableRow>
              )}

              {results.map((i) => (
                <TableRow
                  role="link"
                  tabIndex={0}
                  key={i.id}
                  className="cursor-pointer hover:bg-accent/40 transition"
                  onClick={() => {
                    if (i.status === 'completed') {
                      router.push(`/dashboard/interview/${i.id}`);
                    } else if (i.status === 'created') {
                      router.push(`/interview/${i.id}`);
                    } else {
                      alert('Result not prepared');
                    }
                  }}
                >
                  <TableCell className="font-medium py-4">
                    {i.interviewer_name}
                  </TableCell>

                  <TableCell className="py-4">{i.job_title}</TableCell>

                  <TableCell className="capitalize py-4">
                    {i.interview_type}
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant={
                        i.status === 'COMPLETED'
                          ? 'secondary'
                          : i.status === 'CREATED'
                            ? 'outline'
                            : 'default'
                      }
                    >
                      {i.status?.toLowerCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    {formatDistanceToNow(new Date(i.end_time), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Showing {start} to {end} of {total} results
            </p>

            <div className="space-x-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                disabled={end >= total}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
}
