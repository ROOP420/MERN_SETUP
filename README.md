# Create MERN Pro

Production-ready MERN Stack CLI Generator.

## Features

- 🏗 **Full-stack Boilerplate**: Express.js backend & React frontend
- 🔐 **Authentication**: JWT, Google/GitHub OAuth, Email Verification
- 🛡 **Security**: Helmet, Rate Limiting, CORS, Zod Validation
- 🎨 **Modern UI**: Tailwind CSS v4, Lucide Icons, Shadcn-like components
- 📝 **TypeScript**: Full type safety across the entire stack
- 📦 **Latest Tech**: React 19, Vite 7, Express 5, Mongoose 9

## Usage

```bash
# Run directly with npx
npx create-mern-pro <project-name>

# Example
npx create-mern-pro my-awesome-app
```

## Local Development & Testing

To test the CLI locally without publishing to npm:

1. **Link the package locally**:
   ```bash
   npm link
   ```

2. **Generate a test project**:
   ```bash
   create-mern-pro test-app
   # OR using the local bin script directly:
   node bin/cli.js test-app
   ```

3. **Run the generated project**:
   ```bash
   cd test-app
   
   # Setup environment variables
   cd backend && cp .env.example .env
   # (Edit .env with your MongoDB URI)
   
   # Start backend
   npm run dev
   
   # Start frontend (in new terminal)
   cd frontend && npm run dev
   ```

## Requirements

- Node.js >= 20.0.0
- MongoDB instance (local or Atlas)
