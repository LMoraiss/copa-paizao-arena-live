-- Add INSERT policy for profiles table to allow users to create their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also add a policy to allow the handle_new_user trigger to work
-- Since triggers run with elevated privileges, this should handle automatic profile creation