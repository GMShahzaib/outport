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
    title: 'Test API B',
    version: '1.0.0',
    servers: ['http://localhost:8081', 'https://www.dummybaseurl2.dummy/api'],
    headers: [
        {
            key: "x-globe-header",
            value: "AJFLJL23J43908F09A8SD09",
            description: "This is a globe header description",
        }
    ],
    description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...`,
});
```

### 2. Define your API routes

You can define your API endpoints by using the `outport.use()` method, passing an array of route objects. Below is an example of defining GET and POST routes:

```javascript
outport.use("Apis title", [
    {
        path: '/test-get',
        method: 'get',
        summary: "It's a testing GET API.",
        headers: [
            { key: "header1", value: "50", description: "This is header 1 description" },
            { key: "header2", value: "50", description: "This is header 2 description" }
        ],
        parameters: [
            { key: "param1", value: "50", description: "This is param1 description" },
            { key: "param2", value: "50", description: "This is param2 description" }
        ],
        responses: [],
    },
    {
        path: '/test-post',
        method: 'post',
        summary: "It's a testing POST API.",
        body: { hello: 50 },
        parameters: [
            { key: "hello", value: "50", description: "This is description" }
        ],
        responses: [],
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

## License

This project is licensed under the MIT License.
```