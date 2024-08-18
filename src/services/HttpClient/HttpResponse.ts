export class HttpResponse<T> {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body?: T;

    constructor(statusCode: number, headers: Record<string, string | string[] | undefined>, body?: T) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }
}
