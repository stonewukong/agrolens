-- Drop the existing insert policy if it exists
drop policy if exists "Users can insert their own profile." on profiles;

-- Create a new insert policy that allows profile creation during signup
create policy "Enable insert for authentication users only"
    on profiles for insert
    with check (
        -- Allow insert when the ID matches the authenticated user
        -- OR when the user is not authenticated (during signup)
        auth.uid() = id or auth.uid() is null
    ); 