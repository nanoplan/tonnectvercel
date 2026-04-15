-- Create user_tasks table to track completed tasks
CREATE TABLE public.user_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id bigint NOT NULL,
  task_type text NOT NULL,
  task_milestone integer NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  reward_amount numeric NOT NULL,
  UNIQUE(user_id, task_type, task_milestone)
);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tasks are viewable by everyone"
  ON public.user_tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own tasks"
  ON public.user_tasks FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX idx_user_tasks_type_milestone ON public.user_tasks(task_type, task_milestone);
