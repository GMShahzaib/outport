import { SchemaApi, SchemaParser } from './parser.js';
import { APIDocumentation, Endpoint, Parameter, Response } from './schema.js';
import uidGenerator from './utils/uidGenerator.js';
import Style from './styles/main.js';

export class DocumentationGenerator {
  private parser: SchemaParser;
  private apis: SchemaApi[];

  constructor(schema: APIDocumentation) {
    this.parser = new SchemaParser(schema);
    this.apis = [];
  }

  public generate(): string {
    const parsedData = JSON.parse(this.parser.parse());
    return this.buildHTML(parsedData);
  }

  public use(name: string, endpoints: Endpoint[]): void {
    this.apis.push({ name, endpoints });
  }

  private buildHTML(data: APIDocumentation): string {
    const { title, version, basePath } = data;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} Documentation</title>
          <link rel="stylesheet" href="path/to/your/css/file.css">
          <style>
            ${Style}
          </style>
      </head>
      <body>
          ${this.buildHeader(title, version, basePath)}
          <main>
              ${this.buildApiSections()}
          </main>
          <script>
              function toggleContent(id) {
                const content = document.getElementById(id);
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
              }
          </script>
      </body>
      </html>
    `;
  }

  private buildHeader(title: string, version: string, basePath: string): string {
    return `
      <header>
          <h1>${title} Documentation</h1>
          <p>Version: ${version}</p>
          <p>Base Path: ${basePath}</p>
      </header>
    `;
  }

  private buildApiSections(): string {
    return this.apis
      .map(({ name, endpoints }) => this.buildApiSection(name, endpoints))
      .join('');
  }

  private buildApiSection(name: string, endpoints: Endpoint[]): string {
    const categoryId = uidGenerator();
    return `
      <section>
        <div class="collapsible-main">
          <div class="clickable ptb-10" onclick="toggleContent('${categoryId}')">
            <span class="collection-name">${name}</span>
          </div>
          <div id="${categoryId}" class="endpoints">
            ${endpoints.map(endpoint => this.buildEndpointSection(endpoint)).join('')}
          </div>
        </div>
      </section>
    `;
  }

  private buildEndpointSection(endpoint: Endpoint): string {
    const endpointId = uidGenerator();
    return `
      <div class="collapsible" onclick="toggleContent('${endpointId}')">
        <div class="flex clickable ptb-5">
          <div class="http-method ${endpoint.method.toLowerCase()}">${endpoint.method}</div>
          <div class="endpoint-path">${endpoint.path}</div>
          <div class="endpoint-summary">${endpoint.summary}</div>
        </div>
        <div id="${endpointId}" class="endpoint">
          ${endpoint.description ? this.buildDescription(endpoint.description) : ""}
          ${endpoint.parameters ? this.buildParameters(endpoint.parameters) : ""}
          ${endpoint.responses ? this.buildResponses(endpoint.responses) : ""}
        </div>
      </div>
    `;
  }

  private buildDescription(description?: string): string {
    return `<p><strong>Description:</strong> ${description}</p>`;
  }

  private buildParameters(parameters: Parameter[]): string {
    return `
      <h4>Parameters:</h4>
      <ul>
        ${parameters.map(param => this.buildParameterSection(param)).join('')}
      </ul>
    `;
  }

  private buildParameterSection(param: Parameter): string {
    return `
      <li class="parameter">
        <strong>${param.name}</strong> (${param.type}) ${param.required ? '<em>(required)</em>' : ''} - ${param.description || ''}
      </li>
    `;
  }

  private buildResponses(responses: Response[]): string {
    return `
      <h4>Responses:</h4>
      <div>
        ${responses.map(response => this.buildResponseSection(response)).join('')}
      </div>
    `;
  }

  private buildResponseSection(response: Response): string {
    return `
      <div class="response">
        <strong>${response.status}</strong> - ${response.description}
      </div>
    `;
  }
}
