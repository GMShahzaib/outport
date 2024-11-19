# Outport

Outport is a versatile library for API testing and documentation, offering a user-friendly interface to define, test, and visualize API endpoints for seamless debugging and collaboration.

## Demo

Check out a live demo of Outport [here](https://bugstuck.com/docs/).

## Features

- Easily document API endpoints.
- Auto-generate API documentation with a clean interface.
- Debugging support for API endpoints with detailed request information.
- Define headers, parameters, body, and responses for API routes.
- Simple setup and usage in an Express environment.
- Supports multiple servers and environments.

---

## Installation

Install **Outport** via NPM:

```bash
npm install outport
```
---

## Usage

To use **Outport** in your project, follow these steps:

### 1. Import and Configure Outport

Import **Outport** and initialize it with your configuration in an Express app:

```javascript
import Outport from 'outport';

const outport = new Outport({
    title: 'User Management APIs',
    version: '1.1.4',
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
    description: `Outport is a versatile library for API testing and documentation, offering a user-friendly interface to define, test, and visualize API endpoints for seamless debugging and collaboration.`,
    playground:true
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

---

## Scripts

- **`npm run build`**: Transpiles TypeScript files and copies public assets to the `lib/` directory.
- **`npm run test`**: Placeholder for tests, currently outputs a test error.

---

## Development Dependencies

The project relies on the following development dependencies:

- **TypeScript**: Used to compile TypeScript source files.
- **@types/express** and **@types/node**: TypeScript types for Express and Node.
- **copyfiles**: Utility for copying assets (HTML, PNG, CSS) from `src/public` to `lib`.

---

## Peer Dependencies

- **Express**: Works with both Express 4 and the upcoming Express 5 beta releases.

---

## Contributors

- **Mirza Shahzaib** ([GitHub](https://github.com/GMShahzaib))  
  Email: gms.shahzaib@gmail.com

---

## License

This project is licensed under the ISC License.

---

## Repository

Find the source code and contribute at [GitHub](https://github.com/GMShahzaib/outport).

---