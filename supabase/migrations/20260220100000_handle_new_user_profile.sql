-- Create profile (and employee/employer profile) when a new auth user is created.
-- This runs with elevated privileges so RLS does not block the insert.
-- The app passes full_name and user_type via signUp options.data; email comes from auth.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  meta jsonb;
  ut text;
  fn text;
  em text;
  av text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  fn := COALESCE(meta->>'full_name', meta->>'name', '');
  ut := COALESCE(meta->>'user_type', 'employee');
  em := COALESCE(NEW.email, meta->>'email', '');
  av := COALESCE(meta->>'avatar_url', meta->>'picture', '');

  INSERT INTO public.profiles (id, user_type, full_name, email, avatar_url)
  VALUES (NEW.id, ut, fn, em, NULLIF(av, ''));

  IF ut = 'employee' THEN
    INSERT INTO public.employee_profiles (id, position_type)
    VALUES (NEW.id, 'server');
  ELSE
    INSERT INTO public.employer_profiles (id, business_name, business_type)
    VALUES (NEW.id, '', 'restaurant');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
