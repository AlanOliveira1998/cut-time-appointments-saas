-- Fix appointment creation policy for public users
-- The current policy only allows barber owners to manage appointments
-- But the booking page is accessed by anonymous users who need to create appointments

-- Add policy to allow public users to create appointments
CREATE POLICY "Public can create appointments" 
ON public.appointments 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Add policy to allow public users to view appointments (for checking availability)
CREATE POLICY "Public can view appointments" 
ON public.appointments 
FOR SELECT 
TO anon, authenticated
USING (true); 