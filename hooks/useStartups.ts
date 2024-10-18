import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { Startup } from "@/types/startups.types";

export const useStartups = (
  page: number = 0,
  pageSize: number = 10,
  filters?: string,
  search?: string,
) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasmore] = useState<null | any>(null);
  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      let query = supabase
        .from("startups")
        .select("*, token(*), user_id(*)");

      // Apply filters
      if (filters === "Recientes") {
        query = query.order("created_at", { ascending: false });
      } else if (filters === "Populares") {
        query = query.order("likes", { ascending: false });
      }

      // Apply search
      if (search) {
        query = query.ilike("name", `%${search}%`); // Adjust column name if needed
      }

      // Apply pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching startups:", error.message);
        setError(error.message);
      } else {
        setStartups((prev) => (page === 0 ? data : [...prev, ...data])); // Append new data if not the first page
        setHasmore(data.length === pageSize); // Set hasMore based on data length
      }
      setLoading(false);
    };

    fetchStartups();
  }, [page, pageSize, filters, search]);

  return { startups, loading, error, hasMore };
};
