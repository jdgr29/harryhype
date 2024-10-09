import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { Startup } from "@/types/startups.types";

export const useStartups = (
  page: number = 0,
  pageSize: number = 10,
  filters?: string,
  search?: string
) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      const query = await supabase
        .from("startups")
        .select("*, token(*), user_id(*)")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Apply filters
      if (filters === "Recientes") {
        query.order("created_at", { ascending: false });
      } else if (filters === "Populares") {
        query.order("likes", { ascending: false });
      }

      // Apply search
      if (search) {
        query.ilike("name", `%${search}%`); // Adjust the column name as needed
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching startups:", error.message);
        setError(error.message);
      } else {
        setStartups((prev) => (page === 0 ? data : [...prev, ...data])); // Append new data
      }
      setLoading(false);
    };

    fetchStartups();
  }, [page, pageSize, filters, search]);

  return { startups, loading, error };
};
