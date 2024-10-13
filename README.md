# Outport

Outport is an API testing and documentation library, that helps you document, test, and visualize your API endpoints. It offers a straightforward and organized way to define your API endpoints and display them in a user-friendly interface.

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

### 1. Import Outport and configure it

First, import **Outport** and initialize it with your desired configuration. Below is an example of how to set up **Outport** in an Express app.

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

### 2. Define your API routes

You can define your API endpoints by using the `outport.use()` method, passing an array of route objects. Below is an example of defining GET and POST routes:

```javascript
outport.use("Users", [
    {
        path: '/users',
        method: 'get',
        summary: "Fetches a list of users.",
        headers: [
            { key: "Authorization", value: "Bearer <token>", description: "JWT token for authorization" },
            { key: "Accept", value: "application/json", description: "Indicates that the client expects a JSON response" }
        ],
        parameters: [
            { key: "page", value: "1", description: "Page number for pagination" },
            { key: "limit", value: "20", description: "Number of users per page" }
        ],
        responses: [
            { code: 200, description: "Success - returns a list of users" },
            { code: 401, description: "Unauthorized - invalid or missing token" },
            { code: 500, description: "Internal server error" }
        ],
    },
    {
        path: '/users',
        method: 'post',
        summary: "Creates a new user.",
        headers: [
            { key: "Authorization", value: "Bearer <token>", description: "JWT token for authorization" },
            { key: "Content-Type", value: "application/json", description: "Indicates the request body is in JSON format" }
        ],
        body: {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123"
        },
        parameters: [],
        responses: [
            { code: 201, description: "User created successfully" },
            { code: 400, description: "Bad request - missing or invalid parameters" },
            { code: 401, description: "Unauthorized - invalid or missing token" }
        ],
    }
]);
```

### 3. Serve the documentation

Finally, you can serve the **Outport** documentation in your Express app using:

```javascript
app.use('/docs', outport.serve());
```

Now, when you visit `/docs` in your browser, you'll be able to see the documentation for your API, complete with endpoints, descriptions, parameters, headers, and more.

## Example Setup

Here’s a complete example of how to use **Outport** in an Express app:

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
        method: 'get',
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

### 4. Accessing the Documentation

Run your Express app and navigate to `/docs` to see the interactive documentation of your API.