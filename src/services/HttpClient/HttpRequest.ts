export class HttpRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: Record<string, string>;
    body?: any;

    constructor(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, headers: Record<string, string> = {}, body?: any) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
}
