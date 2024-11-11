# Outport

Outport is an API testing and documentation library that helps you document, test, and visualize your API endpoints. It provides an organized interface to define your API endpoints and displays them in a user-friendly format for ease of use and debugging.

## Features

- Easily document API endpoints
- Auto-generate API documentation with a clean interface
- Debugging support for API endpoints with detailed request information
- Define headers, parameters, body, and responses for API routes
- Simple setup and usage in an Express environment
- Supports multiple servers and environments

## Installation

Install **Outport** via NPM:

```bash
npm install outport
```

## Usage

To use **Outport** in your project, follow the steps below:

### 1. Import Outport and Configure It

Import **Outport** and initialize it with your configuration. Here's an example setup in an Express app:

```javascript
import Outport from 'outport';

const outport = new Outport({
    title: 'User Management APIs',
    version: '1.0.0',
    servers: [
        'http://localhost:8081',
        'https://api.example.com/v1'
    ],
    headers: [
        {
            key: "x-api-key",
            value: "YOUR_API_KEY_HERE",
            description: "API key required to authenticate requests"
        },
        {
            key: "x-globe-header",
            value: "AJFLJL23J43908F09A8SD09",
            description: "Used for global session identification across requests"
        }
    ],
    description: `Outport is an API testing and documentation library that helps you document, test, and visualize your API endpoints in a user-friendly interface.`,
});
```

### 2. Define API Routes

Define API endpoints using the `outport.use()` method. Here’s an example defining GET and POST routes:

```javascript
outport.use("API Examples", [
    {
        "path": "/test-get",
        "method": "GET",
        "summary": "Fetches example data.",
        "headers": [
            { "key": "header1", "value": "50", "description": "Example header" },
            { "key": "header2", "value": "50", "description": "Another example header" }
        ],
        "parameters": [
            { "key": "param1", "value": "50", "description": "Example parameter", "required": false },
            { "key": "param2", "value": "50", "description": "Another parameter", "required": false },
            { "key": "param3", "value": "50", "description": "Third parameter", "required": false }
        ],
        "responses": [
            {
                "status": 200,
                "description": "Example Response:",
                "value": {
                    "success": true,
                    "params": {
                        "param1": "50",
                        "param2": "50",
                        "param3": "50"
                    },
                    "message": "success"
                },
                "headers": [
                    { "key": "access-control-allow-origin", "value": "*" },
                    { "key": "content-length", "value": "89" },
                    { "key": "content-type", "value": "application/json; charset=utf-8" },
                    { "key": "date", "value": "Mon, 11 Nov 2024 12:15:38 GMT" },
                    { "key": "etag", "value": "W/\"59-MUxpGl4+hXme7ole0kweVCoQ93Y\"" },
                    { "key": "x-powered-by", "value": "Express" }
                ]
            }
        ]
    },
    {
        "path": '/test-post',
        "method": 'POST',
        "summary": "Submit a test post.",
        "body": {
            "type": "form",
            "data": [
                { "key": "name", "value": 50, "type": 'text' },
                { "key": "profile", "type": 'file' },
                { "key": "address", "type": 'text' }
            ]
        },
        "parameters": [
            { "key": "hello", "value": "50", "description": "Description here", "required": false },
            { "key": "hello2", "value": "50", "description": "Second description", "required": false }
        ],
        "responses": [
            { "status": 200, "description": "This is my test description." }
        ]
    }
]);
```

### 3. Serve the Documentation

Serve the **Outport** documentation in your Express app:

```javascript
app.use('/docs', outport.serve());
```

### 4. Accessing the Documentation

Start your app and navigate to `/docs` to access the interactive documentation of your API.

## Scripts

- **`npm run build`**: Transpiles TypeScript files and copies public assets to the `dist/` directory.
- **`npm run test`**: Placeholder for tests, currently outputs a test error.

## Development Dependencies

The project relies on the following development dependencies:

- **TypeScript**: Used to compile TypeScript source files.
- **@types/express** and **@types/node**: TypeScript types for Express and Node.
- **copyfiles**: Utility for copying assets (HTML, PNG, CSS) from `src/public` to `dist`.

## Peer Dependencies

- **Express**: Works with both Express 4 and the upcoming Express 5 beta releases.
