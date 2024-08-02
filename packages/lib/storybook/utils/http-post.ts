const { host, protocol } = window.location;

export async function httpPost<T>(endpoint: string, data: any): Promise<T> {
    const bla = 'localhost:3020';
    const response = await fetch(`${protocol}//${bla}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
