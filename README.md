# Outport

Outport is an API testing and documentation library that helps you document, test, and visualize your API endpoints. It offers a straightforward and organized way to define your API endpoints and display them in a user-friendly interface.

## Features

- Easily document your API endpoints
- Include headers, parameters, body, and responses
- Auto-generate API documentation
- Simple setup and usage
- Supports multiple servers and environments

## Installation

You can install **Outport** via NPM:

```bash
npm install outport
```

## Usage

To use **Outport** in your project, follow the steps below:

### 1. Import Outport and Configure It

Import **Outport** and initialize it with your desired configuration. Below is an example of how to set up **Outport** in an Express app.

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
            description: "API key required to authenticate requests",
        },
        {
            key: "x-globe-header",
            value: "AJFLJL23J43908F09A8SD09",
            description: "Used for global session identification across requests",
        }
    ],
    description: `Outport is an API testing and documentation library, that helps you document, test, and visualize your API endpoints.
    It offers a straightforward and organized way to define your API endpoints and display them in a user-friendly interface.`,
});
```

### 2. Define Your API Routes

Define your API endpoints using the `outport.use()` method by passing an array of route objects. Below is an example that defines GET and POST routes:

```javascript
outport.use("Apis title", [
    {
        path: "/test-get",
        method: "GET",
        summary: "Fetches example data.",
        headers: [
            { key: "header1", value: "50", description: "Example header" },
            { key: "header2", value: "50", description: "Another example header" }
        ],
        parameters: [
            { key: "param1", value: "50", description: "Example parameter", required: false },
            { key: "param2", value: "50", description: "Another parameter", required: false },
            { key: "param3", value: "50", description: "Third parameter", required: false }
        ],
        responses: [
            {
                status: 200,
                description: "Example Response:",
                value: {
                    success: true,
                    params: {
                        param1: "50",
                        param2: "50",
                        param3: "50"
                    },
                    message: "success"
                },
                headers: [
                    { key: "access-control-allow-origin", value: "*" },
                    { key: "content-length", value: "89" },
                    { key: "content-type", value: "application/json; charset=utf-8" },
                    { key: "date", value: "Mon, 11 Nov 2024 12:15:38 GMT" },
                    { key: "etag", value: "W/\"59-MUxpGl4+hXme7ole0kweVCoQ93Y\"" },
                    { key: "x-powered-by", value: "Express" }
                ]
            }
        ]
    },
    {
        path: '/test-get/{id}/products/{pid}',
        method: 'GET',
        summary: "Fetch product details.",
        parameters: [
            { key: "hello", value: "50", description: "Sample parameter", required: false },
            { key: "hello2", value: "50", description: "Additional parameter", required: false },
            { key: "hello3", value: "50", description: "Extra parameter", required: false }
        ],
        responses: [
            { status: 200, description: "This is my test description." }
        ]
    },
    {
        path: '/test-post',
        method: 'POST',
        summary: "Submit a test post.",
        body: {
            type: "form",
            data: [
                { key: "name", value: 50, type: 'text' },
                { key: "profile", type: 'file' },
                { key: "address", type: 'text' }
            ]
        },
        parameters: [
            { key: "hello", value: "50", description: "Description here", required: false },
            { key: "hello2", value: "50", description: "Second description", required: false }
        ],
        responses: [
            { status: 200, description: "This is my test description." }
        ]
    },
    {
        path: '/test-post',
        method: 'POST',
        summary: "Submit JSON data.",
        body: {
            type: "json",
            data: [
                { key: "hello", value: 50, type: 'text' }
            ]
        },
        parameters: [],
        responses: [
            { status: 200, description: "This is my test description." }
        ]
    }
]);

outport.use("auth", [
    {
        path: '/test-get',
        method: 'GET',
        summary: "Auth endpoint example.",
        headers: [
            { key: "header1", value: "50", description: "Description for header1" },
            { key: "header2", value: "50", description: "Description for header2" }
        ],
        parameters: [
            { key: "param1", value: "50", description: "Param description", required: false },
            { key: "param2", value: "50", description: "Another param description", required: false },
            { key: "param3", value: "50", description: "Third param description", required: false }
        ],
        responses: []
    }
]);
```

### 3. Serve the Documentation

Serve the **Outport** documentation in your Express app using:

```javascript
app.use('/docs', outport.serve());
```

### 4. Example Setup

Here's a complete example of how to use **Outport** in an Express app:

```javascript
import express from 'express';
import Outport from 'outport';

const app = express();

const outport = new Outport({
    title: 'My API',
    version: '1.0.0',
    servers: ['http://localhost:3000'],
    headers: [
        {
            key: "Authorization",
            value: "Bearer TOKEN",
            description: "Authorization header"
        }
    ],
    description: 'API Documentation using Outport.',
});

outport.use("Example APIs", [
    {
        path: '/example-get',
        method: 'GET',
        summary: "Example GET endpoint",
        headers: [
            { key: "Authorization", value: "Bearer TOKEN", description: "Authorization token" }
        ],
        parameters: [
            { key: "param1", value: "value1", description: "Example parameter" }
        ],
        responses: [],
    }
]);

app.use('/docs', outport.serve());

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

### 5. Accessing the Documentation

Run your Express app and navigate to `/docs` to see the interactive documentation of your API.
