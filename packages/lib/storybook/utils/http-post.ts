const { host, protocol } = window.location;

export async function httpPost<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
