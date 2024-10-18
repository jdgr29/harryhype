export const uriToBlob = async (uri: any) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
};
