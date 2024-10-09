import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { UserResponse } from "@supabase/supabase-js";
import { SupabaseTokenRecord } from "@/types";

/** 
@returns all the tokens own by a particular user already hooked to supabase client
**/
export const useTokens = () => {
  const [tokens, setTokens] = useState<null | undefined | SupabaseTokenRecord>(
    null
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      const id: UserResponse = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("user_id", id.data.user?.id);

      if (error) {
        console.error("Error fetching tokens:", error.message);
        setError(error.message);
        setTokens(null);
      } else {
        setTokens(data);
      }
      setLoading(false);
    };

    fetchTokens();
  }, []); // Empty dependency array ensures this runs once on mount

  return { tokens, loading, error };
};
