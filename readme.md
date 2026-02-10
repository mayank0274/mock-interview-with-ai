# Interviewly

An AI mock interview platform built to learn and explore Generative AI, LangChain, and event-driven workflows.  
Next, I will work on reducing AI response latency and adding a code editor for coding questions.


## Tech Stack

- Next.js
- FastAPI
- LangChain
- Inngest – [https://www.inngest.com/](https://www.inngest.com/)
- Redis
- PostgreSQL

https://github.com/user-attachments/assets/ddd62d8f-15ed-4c4f-8a21-f8321011d631

## Working

1. User creates and starts an interview
2. Audio responses are uploaded during the session
3. Each upload triggers transcription and evaluation
4. The transcription submitted for evaluation
     - If expired final eval and scoring is triggered
     - Otherwise next question/feedback is generated 
5. New questions are generated until time runs out
6. A final evaluation is automatically prepared
<img width="938" height="803" alt="image" src="https://github.com/user-attachments/assets/f9e1f05c-a62a-44e3-a8a0-befce81121a1" />

# Setup locally

1. [Frontend instructions](https://github.com/mayank0274/mock-interview-with-ai/blob/main/frontend/README.md)
2. [Backend instructions](https://github.com/mayank0274/mock-interview-with-ai/blob/main/backend/README.md)
