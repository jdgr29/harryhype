import { supabase } from "@/libs/supabase";

//TODO this is useless? wtf?
export const login = async (loginData: { email: string; password: string }) => {
  try {
    const response = await supabase.functions.invoke("login", {
      body: JSON.stringify(loginData),
    });
    console.log("response invoked?", response);
    if (response) {
      return true;
    }
  } catch (err) {
    console.log("error in login service", err);
  }
};
