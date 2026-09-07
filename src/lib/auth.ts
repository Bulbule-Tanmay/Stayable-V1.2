import { supabase } from "./supabase";

export async function signUpStudent(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      role: "student",
      email,
    });
  }
  return data;
}

export async function signUpOwner(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone, role: "owner" } },
  });
  if (error) throw error;
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      role: "owner",
      full_name: fullName,
      phone,
      email,
    });
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInStudent(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  return data;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  if (data.user) {
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", data.user.id).single();
    if (!existing) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        role: "student",
        email: data.user.email,
      });
    }
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUserProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}
