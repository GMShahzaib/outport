import fs from 'fs';
import { SchemaParser } from './parser.js';
import { APIDocumentation } from './schema.js';

export class DocumentationGenerator {
  private parser: SchemaParser;

  constructor(schema: APIDocumentation) {
    this.parser = new SchemaParser(schema);
  }

  public generate(outputPath: string): void {
    const parsedData = JSON.parse(this.parser.parse());

    const htmlContent = this.buildHTML(parsedData);
    fs.writeFileSync(outputPath, htmlContent);
  }

  private buildHTML(data: APIDocumentation): string {
    const { title, version, basePath, endpoints } = data;

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} Documentation</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          header h1 {
            margin: 0;
          }
          main {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          h2, h3, h4 {
            color: #007bff;
            margin-top: 1em;
          }
          .endpoint {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .endpoint:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .endpoint h3 {
            margin-bottom: 10px;
          }
          .endpoint p {
            margin: 5px 0;
          }
          ul {
            list-style-type: none;
            padding-left: 0;
          }
          li {
            margin-bottom: 5px;
          }
          .parameter, .response {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 5px;
            border: 1px solid #ddd;
          }
          .parameter strong, .response strong {
            color: #333;
          }
          .parameter em, .response em {
            color: #666;
          }
        </style>
    </head>
    <body>
        <header>
            <h1>${title} Documentation</h1>
            <p>Version: ${version}</p>
            <p>Base Path: ${basePath}</p>
        </header>
        <main>
    `;

    endpoints.forEach(endpoint => {
      html += `
        <div class="endpoint">
            <h3>${endpoint.method} ${endpoint.path}</h3>
            <p><strong>Summary:</strong> ${endpoint.summary}</p>
            ${endpoint.description ? `<p><strong>Description:</strong> ${endpoint.description}</p>` : ''}
            <h4>Parameters:</h4>
            <ul>
      `;

      (endpoint.parameters || []).forEach(param => {
        html += `
          <li class="parameter">
              <strong>${param.name}</strong> (${param.type}) ${param.required ? '<em>(required)</em>' : ''} - ${param.description || ''}
          </li>
        `;
      });

      html += `</ul><h4>Responses:</h4><ul>`;

      endpoint.responses.forEach(response => {
        html += `
          <li class="response">
              <strong>${response.status}</strong> - ${response.description}
          </li>
        `;
      });

      html += `</ul></div>`;
    });

    html += `
        </main>
    </body>
    </html>
    `;

    return html;
  }
}
