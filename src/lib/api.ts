import { supabase } from "@/integrations/supabase/client";

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  tone: string;
  topics: string;
  platforms: string[];
  frequency: string;
  is_active: boolean;
  created_at: string;
};

export type Connection = {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  status: string;
  connected_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  agent_id: string | null;
  platform: string;
  content: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
};

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function listAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Agent[];
}

export async function createAgent(
  input: Omit<Agent, "id" | "user_id" | "created_at" | "is_active"> & { is_active?: boolean },
) {
  const user_id = await currentUserId();
  const { error } = await supabase.from("agents").insert({ ...input, user_id });
  if (error) throw error;
}

export async function updateAgent(id: string, patch: Partial<Agent>) {
  const { error } = await supabase.from("agents").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAgent(id: string) {
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
}

export async function listConnections(): Promise<Connection[]> {
  const { data, error } = await supabase.from("platform_connections").select("*");
  if (error) throw error;
  return (data ?? []) as Connection[];
}

export async function connectPlatform(platform: string, handle: string) {
  const user_id = await currentUserId();
  const { error } = await supabase
    .from("platform_connections")
    .upsert({ user_id, platform, handle, status: "connected" }, { onConflict: "user_id,platform" });
  if (error) throw error;
}

export async function disconnectPlatform(id: string) {
  const { error } = await supabase.from("platform_connections").delete().eq("id", id);
  if (error) throw error;
}

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function createPost(input: {
  agent_id: string | null;
  platform: string;
  content: string;
  status: string;
  scheduled_at?: string | null;
}) {
  const user_id = await currentUserId();
  const { error } = await supabase.from("posts").insert({
    ...input,
    user_id,
    scheduled_at: input.scheduled_at ?? null,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

export async function publishPost(id: string) {
  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

export async function getProfile(): Promise<Profile | null> {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user_id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Profile | null;
}

export async function updateProfile(patch: { full_name?: string }) {
  const user_id = await currentUserId();
  const { error } = await supabase.from("profiles").update(patch).eq("id", user_id);
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function deleteAllPosts() {
  const user_id = await currentUserId();
  const { error } = await supabase.from("posts").delete().eq("user_id", user_id);
  if (error) throw error;
}

export async function disconnectAllPlatforms() {
  const user_id = await currentUserId();
  const { error } = await supabase.from("platform_connections").delete().eq("user_id", user_id);
  if (error) throw error;
}

export async function deleteAllAgents() {
  const user_id = await currentUserId();
  const { error } = await supabase.from("agents").delete().eq("user_id", user_id);
  if (error) throw error;
}
