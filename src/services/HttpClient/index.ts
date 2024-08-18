import { HttpRequest } from './HttpRequest.js';
import { HttpResponse } from './HttpResponse.js';
import { IncomingMessage } from 'http';
import { request as httpRequest, RequestOptions } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';

export class HttpClient {
    async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
        const url = new URL(req.url);
        const isHttps = url.protocol === 'https:';

        const options: RequestOptions = {
            method: req.method,
            headers: req.headers,
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
        };

        return new Promise<HttpResponse<T>>((resolve, reject) => {
            const transport = isHttps ? httpsRequest : httpRequest;
            const clientRequest = transport(options, (res: IncomingMessage) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const response: HttpResponse<T> = {
                        statusCode: res.statusCode || 500,
                        headers: res.headers,
                        body: data ? JSON.parse(data) : undefined,
                    };
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                });
            });

            clientRequest.on('error', (err) => {
                reject(err);
            });

            if (req.body) {
                clientRequest.write(JSON.stringify(req.body));
            }

            clientRequest.end();
        });
    }

    get<T>(url: string, headers: Record<string, string> = {}): Promise<HttpResponse<T>> {
        return this.request<T>(new HttpRequest('GET', url, headers));
    }

    post<T>(url: string, body: any, headers: Record<string, string> = {}): Promise<HttpResponse<T>> {
        return this.request<T>(new HttpRequest('POST', url, headers, body));
    }

    put<T>(url: string, body: any, headers: Record<string, string> = {}): Promise<HttpResponse<T>> {
        return this.request<T>(new HttpRequest('PUT', url, headers, body));
    }

    delete<T>(url: string, headers: Record<string, string> = {}): Promise<HttpResponse<T>> {
        return this.request<T>(new HttpRequest('DELETE', url, headers));
    }
}
