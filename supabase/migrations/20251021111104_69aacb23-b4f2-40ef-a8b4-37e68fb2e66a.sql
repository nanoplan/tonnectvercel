-- Create profiles table for Telegram users
CREATE TABLE public.profiles (
  id BIGINT PRIMARY KEY,
  username TEXT NOT NULL,
  referred_by BIGINT,
  balance NUMERIC DEFAULT 0 NOT NULL,
  total_claimed NUMERIC DEFAULT 0 NOT NULL,
  last_claim_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (public read, user can update own profile)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create index for leaderboard queries
CREATE INDEX idx_profiles_balance ON public.profiles(balance DESC);

-- Create index for referral queries
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
