import { httpPost } from '../../../core/Services/http';

export interface FastlaneTokenData {
    id: string;
    clientId: string;
    value: string;
    expiresAt: string;
    merchantId: string;
}

function requestFastlaneToken(url: string, clientKey: string): Promise<FastlaneTokenData> {
    const path = `utility/v1/payPalFastlane/tokens?clientKey=${clientKey}`;
    return httpPost<FastlaneTokenData>({ loadingContext: url, path, errorLevel: 'fatal' });

    /**
     * TODO: Endpoint is not ready. The only way to test right now is mocking the response here
     */
    // return Promise.resolve({
    //     id: '2747bd08-783a-45c6-902b-3efbda5497b7',
    //     clientId: 'AXy9hIzWB6h_LjZUHjHmsbsiicSIbL4GKOrcgomEedVjduUinIU4C2llxkW5p0OG0zTNgviYFceaXEnj',
    //     merchantId: 'C3UCKQHMW4948',
    //     value: 'eyJraWQiOiJkMTA2ZTUwNjkzOWYxMWVlYjlkMTAyNDJhYzEyMDAwMiIsInR5cCI6IkpXVCIsImFsZyI6IkVTMjU2In0.eyJpc3MiOiJodHRwczovL2FwaS5zYW5kYm94LnBheXBhbC5jb20iLCJhdWQiOlsiaHR0cHM6Ly9hcGkuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJjaGVja291dC1wbGF5Z3JvdW5kLm5ldGxpZnkuYXBwIl0sInN1YiI6Ik02VE5BRVNaNUZHTk4iLCJhY3IiOlsiY2xpZW50Il0sInNjb3BlIjpbIkJyYWludHJlZTpWYXVsdCJdLCJvcHRpb25zIjp7fSwiYXoiOiJjY2cxOC5zbGMiLCJleHRlcm5hbF9pZCI6WyJQYXlQYWw6QzNVQ0tRSE1XNDk0OCIsIkJyYWludHJlZTozZGI4aG5rdHJ0bXpzMmd0Il0sImV4cCI6MTczMzIyODY5MSwiaWF0IjoxNzMzMjI3NzkxLCJqdGkiOiJVMkFBTGM5a2VYdFByRTh6OHZPTEptUDI2cV94akcyN24tNHJHdUhCMHB1XzE1aHY0bGlrdmFobmlXdjJzbmN0UWFEdjFscFhxTlk0U1VmYkhwR0tnTjNYTlM5OGpaUnB0WWlFbkhZN1JxS21TQUpXZVFIRFdPc3AxRllaVUd3ZyJ9.3Aw31ttXYSCmUcklNi6BrGqWPTw2Z42XDZW_r4SFTZBXz9aUXu3uy6k2cG7WChGx0vss7qFq_3XYswS8t7T9CQ',
    //     expiresAt: '2024-11-01T13:34:01.804+00:00'
    // });
}

export default requestFastlaneToken;
