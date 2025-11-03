import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function savePublicKeys(
  userId: string,
  ed25519Public: string,
  x25519Public: string,
) {
  const { error } = await supabase.from("user_public_keys").upsert({
    user_id: userId,
    ed25519_public: ed25519Public,
    x25519_public: x25519Public,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getPublicKeysByUserId(userId: string) {
  const { data, error } = await supabase
    .from("user_public_keys")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserByPublicKey(publicKey: string) {
  const { data, error } = await supabase
    .from("user_public_keys")
    .select("user_id, ed25519_public, x25519_public")
    .or(`ed25519_public.eq.${publicKey},x25519_public.eq.${publicKey}`)
    .single();
  if (error) return null;
  return data;
}
