import { supabase } from "@/libs/supabase";

export const getStartupById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .eq("id", id)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    console.log("error in getStartupById services", err, err?.message);
  }
};
