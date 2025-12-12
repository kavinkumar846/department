import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gjoqvavesgllyngcanvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqb3F2YXZlc2dsbHluZ2NhbnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTIxNTgsImV4cCI6MjA4MDg2ODE1OH0.i-_sCXkewpn-BQ5url8mtCu1UwKajJh2f-m7RYQTCUU';

export const supabase = createClient(supabaseUrl, supabaseKey);