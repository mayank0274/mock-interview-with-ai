export enum Turn {
  INTERVIEWER = 'interviewer',
  INTERMEDIATE = 'intermediate',
  INTERVIEWEE = 'interviewee',
}

export interface InterviewerResponse {
  interviewer_res: {
    question: string;
    type: 'theory' | 'coding' | 'scenario' | 'follow_up' | 'clarification';
    question_no: number;
  };
  redirect: boolean;
}

export interface InterviewMetaData {
  id: string;
  user_email: string;
  job_title: string;
  job_description: string;
  interview_type: string;
  interviewer_name: string;
  end_time: Date;
}
