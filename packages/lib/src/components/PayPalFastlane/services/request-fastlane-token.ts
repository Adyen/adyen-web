import { httpPost } from '../../../core/Services/http';

export interface FastlaneTokenData {
    id: string;
    clientId: string;
    value: string;
    expiresAt: string;
}

function requestFastlaneToken(url: string, clientKey: string): Promise<FastlaneTokenData> {
    // @ts-ignore ignore for now
    const path = `utility/v1/payPalFastlane/tokens?clientKey=${clientKey}`;

    return Promise.resolve({
        id: '2747bd08-783a-45c6-902b-3efbda5497b7',
        clientId: 'AXy9hIzWB6h_LjZUHjHmsbsiicSIbL4GKOrcgomEedVjduUinIU4C2llxkW5p0OG0zTNgviYFceaXEnj',
        merchantId: 'C3UCKQHMW4948',
        value: 'eyJraWQiOiJkMTA2ZTUwNjkzOWYxMWVlYjlkMTAyNDJhYzEyMDAwMiIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJpc3MiOiJodHRwczovL2FwaS5zYW5kYm94LnBheXBhbC5jb20iLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJjaGVja291dC1wbGF5Z3JvdW5kLm5ldGxpZnkuYXBwIl0sInN1YiI6Ik02VE5BRVNaNUZHTk4iLCJhY3IiOlsiY2xpZW50Il0sInNjb3BlIjpbIkJyYWludHJlZTpWYXVsdCJdLCJvcHRpb25zIjp7fSwiYXoiOiJjY2cxOC5zbGMiLCJleHRlcm5hbF9pZCI6WyJQYXlQYWw6QzNVQ0tRSE1XNDk0OCIsIkJyYWludHJlZTozZGI4aG5rdHJ0bXpzMmd0Il0sImV4cCI6MTczMDg5Nzk4NSwiaWF0IjoxNzMwODk3MDg1LCJqdGkiOiJVMkFBS05JdjBkbjZxaWtEQUMweVctdmJKSWhra3VPYTVSQ2MwMlJNdXVMWWVFUUQ2NE85UjJ1eWtRcFpucjZPanhyT3I3OVdLd0ZadGtwdi1LdUZiWHBHWkxFLU9uUEJEXzdUb1Z0RzI2dE9rM2ZNeHEyaVNna2RUd3UzRk5wQSJ9.p2lVHnIM29OsQQq4Q6N5UeHAs3AWDWs9OZ0DmYG-aMng_Dul6j1zdK4T5WoyWMu8eoM3DXHuRSQfZvD4eUPjLA',
        expiresAt: '2024-11-01T13:34:01.804+00:00'
    });
    // return httpPost<FastlaneTokenData>({ loadingContext: url, path, errorLevel: 'fatal' });
}

export default requestFastlaneToken;
