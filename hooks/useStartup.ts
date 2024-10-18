import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabase";
import { Startup } from "@/types/startups.types";

export const useStartup = (
    startupId: string,
): { startup: Startup; error: string | null; loading: boolean } => {
    const [startup, setStartup] = useState<Startup | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStartups = async () => {
            setLoading(true);
            const { data, error, status } = await supabase
                .from("startups")
                .select("*, token(*), user_id(*)").eq("id", startupId).single();

            if (error) {
                console.error(
                    `Error fetching startup id: ${error.message} ${error}`,
                    error.message,
                );
                setError(error.message);
            } else {
                setStartup(data);
            }
            setLoading(false);
        };

        fetchStartups();
    }, [startupId]);

    return { startup, loading, error };
};
