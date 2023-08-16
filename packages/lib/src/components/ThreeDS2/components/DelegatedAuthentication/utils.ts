export const decodeBase64 = (value: string) => {
    const sanitisedValue = value.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(sanitisedValue), c => c.charCodeAt(0));
};

export const encodeBase64 = (value: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(value)));
};
