import { supabase } from "@/libs/supabase";
import { Alert } from "react-native";

export const supabaseImageUploader = async (
    image: Buffer | string | null | Blob | FormData,
    fileName: string | null | undefined,
    isToken: boolean = false,
    isUser: boolean = false,
): Promise<string | null | boolean> => {
    const trimmedName: string | null | undefined = fileName?.trim().replace(
        " ",
        "",
    );

    try {
        const { data, error } = await supabase.storage
            .from(`${isToken ? "tokens" : isUser ? "users" : "startups"}`)
            .upload(`${trimmedName}`, image!, {
                cacheControl: "3600",
                upsert: true,
            });

        if (error) {
            console.log(
                "error uploading image to supabase",
                error,
                error.message,
            );
            return null;
        }

        const { data: imageUrl } = await supabase.storage
            .from(`${isToken ? "tokens" : isUser ? "users" : "startups"}`)
            .getPublicUrl(data.path);

        return imageUrl.publicUrl;
    } catch (err: any) {
        Alert.alert("no pudimos actualizar la foto 😕");
        return false;
    }
};
