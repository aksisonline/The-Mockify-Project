export const uploadFile = async (file: File): Promise<{ url: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const formData = new FormData();
    formData.append("file", file);

    // Ensure no double slashes by removing trailing slash from baseUrl
    const cleanBaseUrl = baseUrl?.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    const res = await fetch(`${cleanBaseUrl}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await res.json();
    return result; // { url: string }
};

// Implementation of this has to be removed from the rest of the codebase

export const getPublicUrl = (fileUrl: string): string => {
    return fileUrl;
};
