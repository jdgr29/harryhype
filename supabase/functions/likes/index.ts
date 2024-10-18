import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { userId, postId } = await req.json();

  if (!userId || !postId) {
    return new Response("Missing parameters", { status: 400 });
  }

  const { data: likes, error: fetchError } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  if (fetchError) {
    return new Response("Error fetching like status", { status: 500 });
  }

  if (likes) {
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", likes.id);

    if (deleteError) {
      return new Response("Error removing like", { status: 500 });
    }

    return new Response(JSON.stringify({ liked: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    const { error: insertError } = await supabase
      .from("likes")
      .insert([{ user_id: userId, post_id: postId }]);

    if (insertError) {
      return new Response("Error adding like", { status: 500 });
    }

    return new Response(JSON.stringify({ liked: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
