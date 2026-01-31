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

    // Handle conditional OAuth features
    await handleConditionalOAuth(projectPath, config);
}

async function handleConditionalOAuth(projectPath, config) {
    const features = config.features || [];
    const hasGoogleOAuth = features.includes('googleOAuth');
    const hasGitHubOAuth = features.includes('githubOAuth');
    const hasAnyOAuth = hasGoogleOAuth || hasGitHubOAuth;

    // Modify backend package.json to remove OAuth packages if not selected
    await modifyBackendPackageJson(projectPath, hasGoogleOAuth, hasGitHubOAuth, hasAnyOAuth);

    // Modify frontend Login/Signup pages to remove OAuth buttons
    await modifyFrontendAuthPages(projectPath, hasGoogleOAuth, hasGitHubOAuth);

    // Modify backend routes to remove OAuth routes if neither is selected
    if (!hasAnyOAuth) {
        await removeOAuthFromBackend(projectPath);
    }
}

async function modifyBackendPackageJson(projectPath, hasGoogleOAuth, hasGitHubOAuth, hasAnyOAuth) {
    const pkgPath = path.join(projectPath, 'backend', 'package.json');
    if (!await fs.pathExists(pkgPath)) return;

    const pkg = await fs.readJson(pkgPath);

    // Remove OAuth packages based on selection
    if (!hasGoogleOAuth) {
        delete pkg.dependencies['passport-google-oauth20'];
        delete pkg.devDependencies['@types/passport-google-oauth20'];
    }

    if (!hasGitHubOAuth) {
        delete pkg.dependencies['passport-github2'];
        delete pkg.devDependencies['@types/passport-github2'];
    }

    // Remove passport entirely if no OAuth at all
    if (!hasAnyOAuth) {
        delete pkg.dependencies['passport'];
        delete pkg.devDependencies['@types/passport'];
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 4 });
}

async function modifyFrontendAuthPages(projectPath, hasGoogleOAuth, hasGitHubOAuth) {
    const hasAnyOAuth = hasGoogleOAuth || hasGitHubOAuth;

    // Modify Login.tsx
    const loginPath = path.join(projectPath, 'frontend', 'src', 'pages', 'public', 'Login.tsx');
    if (await fs.pathExists(loginPath)) {
        let content = await fs.readFile(loginPath, 'utf-8');
        content = modifyOAuthSection(content, hasGoogleOAuth, hasGitHubOAuth, hasAnyOAuth);
        await fs.writeFile(loginPath, content);
    }

    // Modify Signup.tsx
    const signupPath = path.join(projectPath, 'frontend', 'src', 'pages', 'public', 'Signup.tsx');
    if (await fs.pathExists(signupPath)) {
        let content = await fs.readFile(signupPath, 'utf-8');
        content = modifyOAuthSection(content, hasGoogleOAuth, hasGitHubOAuth, hasAnyOAuth);
        await fs.writeFile(signupPath, content);
    }
}

function modifyOAuthSection(content, hasGoogleOAuth, hasGitHubOAuth, hasAnyOAuth) {
    // If no OAuth at all, remove the entire OAuth section (divider + buttons) and authService import
    if (!hasAnyOAuth) {
        // Remove authService import
        content = content.replace("import { authService } from '@/services/auth.service';\n", '');

        // Remove the divider and OAuth buttons section
        // Find the start of the divider section
        const dividerStart = content.indexOf('{/* Divider */}');
        if (dividerStart !== -1) {
            // Find the end of the OAuth Buttons section (closing </div> after grid)
            const oauthButtonsStart = content.indexOf('{/* OAuth Buttons */}', dividerStart);
            if (oauthButtonsStart !== -1) {
                // Find the closing </div> of the OAuth buttons grid
                const gridEnd = content.indexOf('</div>', oauthButtonsStart);
                if (gridEnd !== -1) {
                    // Remove from divider start to after the closing div and any trailing whitespace
                    const sectionEnd = gridEnd + '</div>'.length;
                    content = content.substring(0, dividerStart) + content.substring(sectionEnd);
                }
            }
        }

        return content;
    }

    // Remove only Google button if not selected
    if (!hasGoogleOAuth) {
        const googleButtonStart = content.indexOf('<a\n                    href={authService.getGoogleAuthUrl()}');
        if (googleButtonStart !== -1) {
            const googleButtonEnd = content.indexOf('</a>', googleButtonStart) + '</a>'.length;
            // Also remove any trailing newlines
            let endIndex = googleButtonEnd;
            while (content[endIndex] === '\n' || content[endIndex] === ' ') {
                endIndex++;
            }
            content = content.substring(0, googleButtonStart) + content.substring(endIndex);
        }
    }

    // Remove only GitHub button if not selected
    if (!hasGitHubOAuth) {
        const githubButtonStart = content.indexOf('<a\n                    href={authService.getGitHubAuthUrl()}');
        if (githubButtonStart !== -1) {
            const githubButtonEnd = content.indexOf('</a>', githubButtonStart) + '</a>'.length;
            content = content.substring(0, githubButtonStart) + content.substring(githubButtonEnd);
        }
    }

    // If only one OAuth, change grid-cols-2 to grid-cols-1
    if (hasGoogleOAuth !== hasGitHubOAuth) {
        content = content.replace('grid-cols-2', 'grid-cols-1');
    }

    return content;
}

async function removeOAuthFromBackend(projectPath) {
    // Modify app.ts to remove passport initialization
    const appPath = path.join(projectPath, 'backend', 'src', 'app.ts');
    if (await fs.pathExists(appPath)) {
        let content = await fs.readFile(appPath, 'utf-8');
        // Remove passport import
        content = content.replace("import passport from 'passport';\n", '');
        // Remove configurePassport from import
        content = content.replace(', configurePassport', '');
        // Remove passport initialization lines
        content = content.replace(`// Passport initialization
app.use(passport.initialize());
configurePassport();

`, '');
        await fs.writeFile(appPath, content);
    }

    // Modify auth.routes.ts to remove OAuth routes
    const routesPath = path.join(projectPath, 'backend', 'src', 'routes', 'auth.routes.ts');
    if (await fs.pathExists(routesPath)) {
        let content = await fs.readFile(routesPath, 'utf-8');

        // Remove specific OAuth import lines (exact matches)
        content = content.replace('    googleAuth,\n', '');
        content = content.replace('    googleAuthCallback,\n', '');
        content = content.replace('    googleCallback,\n', '');
        content = content.replace('    githubAuth,\n', '');
        content = content.replace('    githubAuthCallback,\n', '');
        content = content.replace('    githubCallback,\n', '');

        // Remove OAuth route registrations
        content = content.replace(`// OAuth routes - Google
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback, googleCallback);

`, '');
        content = content.replace(`// OAuth routes - GitHub
router.get('/github', githubAuth);
router.get('/github/callback', githubAuthCallback, githubCallback);

`, '');
        await fs.writeFile(routesPath, content);
    }

    // Modify auth.controller.ts to remove passport import and OAuth handlers
    const controllerPath = path.join(projectPath, 'backend', 'src', 'controllers', 'auth.controller.ts');
    if (await fs.pathExists(controllerPath)) {
        let content = await fs.readFile(controllerPath, 'utf-8');
        // Remove passport import
        content = content.replace("import passport from 'passport';\n", '');

        // Remove everything from "// Passport authentication handlers" to end of file
        const passportHandlersIndex = content.indexOf('// Passport authentication handlers');
        if (passportHandlersIndex !== -1) {
            content = content.substring(0, passportHandlersIndex);
        }

        // Remove Google OAuth callback function
        const googleCallbackStart = content.indexOf('/**\n * @desc    Google OAuth callback');
        if (googleCallbackStart !== -1) {
            const googleCallbackEnd = content.indexOf('});\n', googleCallbackStart) + 4;
            content = content.substring(0, googleCallbackStart) + content.substring(googleCallbackEnd);
        }

        // Remove GitHub OAuth callback function
        const githubCallbackStart = content.indexOf('/**\n * @desc    GitHub OAuth callback');
        if (githubCallbackStart !== -1) {
            const githubCallbackEnd = content.indexOf('});\n', githubCallbackStart) + 4;
            content = content.substring(0, githubCallbackStart) + content.substring(githubCallbackEnd);
        }

        await fs.writeFile(controllerPath, content);
    }

    // Remove passport.config.ts
    const passportConfigPath = path.join(projectPath, 'backend', 'src', 'config', 'passport.config.ts');
    if (await fs.pathExists(passportConfigPath)) {
        await fs.remove(passportConfigPath);
    }

    // Update config index to not export passport
    const configIndexPath = path.join(projectPath, 'backend', 'src', 'config', 'index.ts');
    if (await fs.pathExists(configIndexPath)) {
        let content = await fs.readFile(configIndexPath, 'utf-8');
        content = content.replace("export { configurePassport } from './passport.config.js';\n", '');
        await fs.writeFile(configIndexPath, content);
    }
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
