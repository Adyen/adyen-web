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
        value: 'eyJraWQiOiJkMTA2ZTUwNjkzOWYxMWVlYjlkMTAyNDJhYzEyMDAwMiIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJpc3MiOiJodHRwczovL2FwaS5zYW5kYm94LnBheXBhbC5jb20iLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJjaGVja291dC1wbGF5Z3JvdW5kLm5ldGxpZnkuYXBwIl0sInN1YiI6Ik02VE5BRVNaNUZHTk4iLCJhY3IiOlsiY2xpZW50Il0sInNjb3BlIjpbIkJyYWludHJlZTpWYXVsdCJdLCJvcHRpb25zIjp7fSwiYXoiOiJjY2cxOC5zbGMiLCJleHRlcm5hbF9pZCI6WyJQYXlQYWw6QzNVQ0tRSE1XNDk0OCIsIkJyYWludHJlZTozZGI4aG5rdHJ0bXpzMmd0Il0sImV4cCI6MTczMDk4ODQ5MSwiaWF0IjoxNzMwOTg3NTkxLCJqdGkiOiJVMkFBTHJkX3lOb3lMM2tqNzNYZndXTWtFdHBDdFA4aklJZkhtV1dMRFJ1UlYyR0U2M1A2b2RDNmZoTjF3Nmg1YUhQWFFUWFkzTzhuZG16ZmtuZmJJWC1zRGx0R2FRamt0RDd2cVVya2NNZkxlbEFIa1ZYSVptZkpNb0JVNWtRZyJ9.sRKQXrQjRn2CEOIeBwXsspd8Z7axRdMYjY95ga6mfYemcQrKZxBe3ASDCuWrCpbUvm04VTxXs80bR4V7hDAHoQ',
        expiresAt: '2024-11-01T13:34:01.804+00:00'
    });
    // return httpPost<FastlaneTokenData>({ loadingContext: url, path, errorLevel: 'fatal' });
}

export default requestFastlaneToken;
