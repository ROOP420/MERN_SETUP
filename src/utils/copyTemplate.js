import path from 'path';
import fs from 'fs-extra';

export async function copyTemplateFiles(templateDir, projectPath, config) {
    // Copy backend template
    const backendSrc = path.join(templateDir, 'backend');
    const backendDest = path.join(projectPath, 'backend');

    if (await fs.pathExists(backendSrc)) {
        await fs.copy(backendSrc, backendDest, {
            filter: (src) => {
                // Only skip if the file is INSIDE a node_modules directory within the template
                const relativePath = path.relative(backendSrc, src);
                return !relativePath.includes('node_modules');
            }
        });

        // Rename gitignore to .gitignore if it exists
        const gitignorePath = path.join(backendDest, 'gitignore');
        if (await fs.pathExists(gitignorePath)) {
            await fs.move(gitignorePath, path.join(backendDest, '.gitignore'));
        }
    }

    // Copy frontend template
    const frontendSrc = path.join(templateDir, 'frontend');
    const frontendDest = path.join(projectPath, 'frontend');

    if (await fs.pathExists(frontendSrc)) {
        await fs.copy(frontendSrc, frontendDest, {
            filter: (src) => {
                // Only skip if the file is INSIDE a node_modules directory within the template
                const relativePath = path.relative(frontendSrc, src);
                return !relativePath.includes('node_modules');
            }
        });

        // Rename gitignore to .gitignore if it exists
        const gitignorePath = path.join(frontendDest, 'gitignore');
        if (await fs.pathExists(gitignorePath)) {
            await fs.move(gitignorePath, path.join(frontendDest, '.gitignore'));
        }
    }

    // Create root files
    await createRootFiles(projectPath, config);
}

export async function updatePackageJson(projectPath, projectName) {
    // Update backend package.json
    const backendPkgPath = path.join(projectPath, 'backend', 'package.json');
    if (await fs.pathExists(backendPkgPath)) {
        const pkg = await fs.readJson(backendPkgPath);
        pkg.name = `${projectName}-backend`;
        await fs.writeJson(backendPkgPath, pkg, { spaces: 2 });
    }

    // Update frontend package.json
    const frontendPkgPath = path.join(projectPath, 'frontend', 'package.json');
    if (await fs.pathExists(frontendPkgPath)) {
        const pkg = await fs.readJson(frontendPkgPath);
        pkg.name = `${projectName}-frontend`;
        await fs.writeJson(frontendPkgPath, pkg, { spaces: 2 });
    }
}

async function createRootFiles(projectPath, config) {
    // Create root .gitignore
    const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Testing
coverage/

# Misc
*.pem
`;

    // Create root README.md
    const readme = `# ${config.projectName}

A production-ready MERN stack application with TypeScript, authentication, and best practices.

## 🚀 Features

- **TypeScript** - Full type safety on both frontend and backend
- **Authentication** - JWT with access/refresh tokens
- **OAuth** - Google and GitHub login
- **Email Verification** - Secure email verification flow
- **Password Reset** - Forgot password functionality
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Zod** - Runtime type validation

## 📁 Project Structure

\`\`\`
${config.projectName}/
├── backend/           # Express + MongoDB + TypeScript
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/   # Zod validation schemas
│   │   ├── types/     # TypeScript types
│   │   └── utils/
│   └── package.json
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── stores/    # Zustand stores
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/   # Zod validation schemas
│   │   └── types/
│   └── package.json
└── README.md
\`\`\`

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google/GitHub OAuth credentials (for OAuth login)

### Installation

1. **Configure environment variables:**

   \`\`\`bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

   \`\`\`bash
   # Frontend
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

2. **Start the backend:**

   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

3. **Start the frontend:**

   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

4. **Open your browser:**
   
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Authentication Flow

### JWT Token Strategy
- **Access Token**: Short-lived (15 min), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### OAuth Flow
1. User clicks "Login with Google/GitHub"
2. Redirected to OAuth provider
3. After authorization, redirected back with tokens
4. Tokens stored and user authenticated

## 📝 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/verify-email/:token | Verify email |
| GET | /api/auth/google | Google OAuth |
| GET | /api/auth/github | GitHub OAuth |

### User Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/me | Get current user |
| PUT | /api/users/me | Update current user |

## 🔒 Security Features

- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- CORS configuration
- Helmet.js security headers
- Rate limiting
- Input validation with Zod

## 📄 License

MIT
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
    await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}
