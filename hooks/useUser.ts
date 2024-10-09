import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { UserResponse } from "@supabase/supabase-js";
import { User } from "@/types";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const id: UserResponse = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id.data.user?.id)
        .single(); // Change "startups" to "user"

      if (error) {
        console.error("Error fetching user:", error.message);
        setError(error.message);
        setUser(null);
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUser();
  }, []); // Empty dependency array ensures this runs once on mount

  return { user, loading, error };
};
