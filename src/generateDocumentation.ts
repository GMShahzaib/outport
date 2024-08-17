import fs from 'fs';
import { SchemaApi, SchemaParser } from './parser.js';
import { APIDocumentation, Endpoint } from './schema.js';

export class DocumentationGenerator {
  private parser: SchemaParser;
  private apis: SchemaApi[];

  constructor(schema: APIDocumentation) {
    this.parser = new SchemaParser(schema);
    this.apis = [];
  }


  public generate(): string {
    const parsedData = JSON.parse(this.parser.parse());
    const htmlContent = this.buildHTML(parsedData, this.apis);
    return htmlContent
  }

  public use(name: string, endpoints: Endpoint[]) {
    this.apis.push({ name, endpoints })
  }


  private buildHTML(data: APIDocumentation, apis: SchemaApi[]): string {
    const { title, version, basePath } = data;
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
              font-size: 2.5em;
          }
          header p {
              margin: 5px 0;
              font-size: 1.2em;
          }
          main {
              max-width: 800px;
              margin: 30px auto;
              background: white;
              padding: 30px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              border-radius: 8px;
          }
          h2, h3, h4 {
              color: #007bff;
              margin-top: 1.5em;
          }
          .endpoint {
              border-bottom: 1px solid #ddd;
              padding-bottom: 15px;
              margin-bottom: 30px;
          }
          .endpoint:last-child {
              border-bottom: none;
              margin-bottom: 0;
          }
          .endpoint h3 {
              margin-bottom: 10px;
              font-size: 1.5em;
          }
          .endpoint p {
              margin: 10px 0;
          }
          ul {
              list-style-type: none;
              padding-left: 0;
          }
          li {
              margin-bottom: 10px;
          }
          .parameter, .response {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 10px;
              border: 1px solid #ddd;
              font-size: 0.95em;
          }
          .parameter strong, .response strong {
              color: #333;
          }
          .parameter em, .response em {
              color: #666;
          }
          .collapsible {
              cursor: pointer;
              padding: 15px;
              border: 1px solid #ccc;
              text-align: left;
              background-color: #f1f1f1;
              margin-top: 20px;
              font-size: 1.2em;
              font-weight: bold;
              border-radius: 5px;
              transition: background-color 0.3s ease;
          }
          .collapsible:hover {
              background-color: #e0e0e0;
          }
          .endpoints {
              padding: 20px;
              display: none;
              border: 1px solid #ccc;
              border-top: none;
              background-color: #fafafa;
              border-radius: 0 0 5px 5px;
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

    apis.forEach(({ name, endpoints }) => {
      html += `<div class="collapsible" onclick="toggleContent('${name}')">${name}</div>
           <div id="${name}" class="endpoints">
             `
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

        (endpoint.responses || []).forEach(response => {
          html += `
            <li class="response">
                <strong>${response.status}</strong> - ${response.description}
            </li>
          `;
        });

        html += `</ul></div>`;
      })
      html += `</div>`;
    });

    html += `
      </main>
  
      <script>
          function toggleContent(id) {
            var content = document.getElementById(id);
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
          }
      </script>
  
      </body>
      </html>
      `;
    return html;
  }
}