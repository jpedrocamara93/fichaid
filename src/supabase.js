import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://afjnxphkaddsuawtsjtf.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmam54cGhrYWRkc3Vhd3RzanRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTkzNDIsImV4cCI6MjA5NjIzNTM0Mn0.lJ9exK14_7A-WI-wrbxt1doL40HHUnTzkXCnTFw7Q48";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);