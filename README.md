# Outport

Outport is an API testing and documentation library that helps you document, test, and visualize your API endpoints. It provides an organized interface to define your API endpoints and displays them in a user-friendly format for ease of use and debugging.


## Demo

Check out a live demo of Outport [here](https://bugstuck.com/docs/).


## Features

- Easily document API endpoints
- Auto-generate API documentation with a clean interface
- Debugging support for API endpoints with detailed request information
- Define headers, parameters, body, and responses for API routes
- Simple setup and usage in an Express environment
- Supports multiple servers and environments

Here’s the updated installation and usage guide:

---

## Installation

Install **Outport** via NPM:

```bash
npm install outport
```

## Usage

To use **Outport** in your project, follow these steps:

### 1. Import Outport and Configure It

Import **Outport** and initialize it with your configuration. Here’s an example setup in an Express app:

```javascript
import Outport from 'outport';

const outport = new Outport({
    title: 'User Management APIs',
    version: '1.0.0',
    servers: [
        'https://outport-demo-production.up.railway.app',
        'http://localhost:8080',
        'https://api.example.com/v1'
    ],
    headers: [
        {
            key: "Authorization",
            value: "Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            description: "Used for global session identification across requests"
        }
    ],
    description: `Outport is an API testing and documentation library that helps you document, test, and visualize your API endpoints in a user-friendly interface.`,
});
```

### 2. Define API Routes

Define your API endpoints using the `outport.use()` method. Here’s an example with routes for `Authentication` and `Users`:

```javascript
outport.use("Authentication", [
    {
        path: "/login",
        method: "POST",
        summary: "Authenticate user and return token.",
        body: {
            type: "json",
            data: [
                { key: "username", value: "johndoe" },
                { key: "email", value: "johndoe@example.com" },
                { key: "password", value: "testing123!" }
            ]
        },
        responses: [
            {
                status: 200,
                description: "Login successful.",
                value: {
                    message: "Login successful",
                    user: {
                        id: 1,
                        username: "johndoe",
                        email: "johndoe@example.com",
                        token: "abc123xyz"
                    }
                }
            }
        ]
    }
]);

outport.use("Users", [
    {
        path: "/users",
        method: "GET",
        summary: "Fetch a list of users.",
        parameters: [
            { key: "page", value: "1", description: "Page number" },
            { key: "limit", value: "10", description: "Items per page" }
        ],
        responses: [
            {
                status: 200,
                description: "List of users.",
                value: {
                    message: "Fetched all users successfully",
                    users: [
                        { id: 1, username: "johndoe", email: "johndoe@example.com" },
                        { id: 2, username: "janedoe", email: "janedoe@example.com" }
                    ]
                }
            }
        ]
    }
]);
```

### 3. Serve the Documentation

Integrate Outport’s documentation in your Express app by adding:

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
