import path from 'path';
import fs from 'fs-extra';

/**
 * Template resolver - determines which template to use based on configuration
 */
function resolveTemplate(templateDir, config) {
    const templates = {
        frontend: null,
        backend: null
    };

    // Resolve frontend template
    if (config.frontend) {
        const framework = config.frontend.frontendFramework;
        const language = config.frontend.frontendLanguage;
        templates.frontend = path.join(templateDir, 'frontend', framework, language);
    }

    // Resolve backend template
    if (config.backend) {
        const runtime = config.backend.backendRuntime;
        if (runtime === 'python') {
            const pythonFramework = config.backend.pythonFramework;
            templates.backend = path.join(templateDir, 'backend', 'python', pythonFramework);
        } else {
            // Node.js
            const language = config.backend.backendLanguage;
            templates.backend = path.join(templateDir, 'backend', 'nodejs', language);
        }
    }

    return templates;
}

export async function copyTemplateFiles(templateDir, projectPath, config) {
    const templates = resolveTemplate(templateDir, config);

    // Copy backend template
    if (templates.backend) {
        const backendDest = path.join(projectPath, 'backend');

        if (await fs.pathExists(templates.backend)) {
            await fs.copy(templates.backend, backendDest, {
                filter: (src) => {
                    const relativePath = path.relative(templates.backend, src);
                    return !relativePath.includes('node_modules') &&
                        !relativePath.includes('__pycache__') &&
                        !relativePath.includes('venv');
                }
            });

            // Rename gitignore to .gitignore if it exists
            const gitignorePath = path.join(backendDest, 'gitignore');
            if (await fs.pathExists(gitignorePath)) {
                await fs.move(gitignorePath, path.join(backendDest, '.gitignore'));
            }
        } else {
            throw new Error(`Backend template not found: ${templates.backend}`);
        }
    }

    // Copy frontend template
    if (templates.frontend) {
        const frontendDest = path.join(projectPath, 'frontend');

        if (await fs.pathExists(templates.frontend)) {
            await fs.copy(templates.frontend, frontendDest, {
                filter: (src) => {
                    const relativePath = path.relative(templates.frontend, src);
                    return !relativePath.includes('node_modules');
                }
            });

            // Rename gitignore to .gitignore if it exists
            const gitignorePath = path.join(frontendDest, 'gitignore');
            if (await fs.pathExists(gitignorePath)) {
                await fs.move(gitignorePath, path.join(frontendDest, '.gitignore'));
            }
        } else {
            throw new Error(`Frontend template not found: ${templates.frontend}`);
        }
    }

    // Create root files
    await createRootFiles(projectPath, config);

    // Handle conditional features
    await handleConditionalFeatures(projectPath, config);
}

async function handleConditionalFeatures(projectPath, config) {
    const features = config.features || [];
    const hasOAuth = features.includes('oauth');

    // Handle OAuth conditional logic
    if (config.backend && config.backend.backendRuntime === 'nodejs') {
        await handleNodeJSOAuth(projectPath, hasOAuth);
    } else if (config.backend && config.backend.backendRuntime === 'python') {
        await handlePythonOAuth(projectPath, config.backend.pythonFramework, hasOAuth);
    }

    // Handle frontend OAuth buttons
    if (config.frontend) {
        await handleFrontendOAuth(projectPath, config.frontend.frontendFramework, hasOAuth);
    }

    // Handle ORM/ODM configuration
    if (config.backend && config.backend.orm) {
        await handleORM(projectPath, config);
    }
}

async function handleNodeJSOAuth(projectPath, hasOAuth) {
    const pkgPath = path.join(projectPath, 'backend', 'package.json');
    if (!await fs.pathExists(pkgPath)) return;

    const pkg = await fs.readJson(pkgPath);

    if (!hasOAuth) {
        // Remove passport and OAuth packages
        delete pkg.dependencies['passport'];
        delete pkg.dependencies['passport-google-oauth20'];
        delete pkg.dependencies['passport-github2'];
        delete pkg.devDependencies['@types/passport'];
        delete pkg.devDependencies['@types/passport-google-oauth20'];
        delete pkg.devDependencies['@types/passport-github2'];

        await fs.writeJson(pkgPath, pkg, { spaces: 2 });

        // Remove passport config
        const passportConfigPath = path.join(projectPath, 'backend', 'src', 'config', 'passport.config.ts');
        if (await fs.pathExists(passportConfigPath)) {
            await fs.remove(passportConfigPath);
        }

        // Modify app.ts to remove passport initialization
        const appPath = path.join(projectPath, 'backend', 'src', 'app.ts');
        if (await fs.pathExists(appPath)) {
            let content = await fs.readFile(appPath, 'utf-8');
            content = content.replace("import passport from 'passport';\n", '');
            content = content.replace(', configurePassport', '');
            content = content.replace(`// Passport initialization\napp.use(passport.initialize());\nconfigurePassport();\n\n`, '');
            await fs.writeFile(appPath, content);
        }

        // Modify auth routes
        const routesPath = path.join(projectPath, 'backend', 'src', 'routes', 'auth.routes.ts');
        if (await fs.pathExists(routesPath)) {
            let content = await fs.readFile(routesPath, 'utf-8');
            content = content.replace('    googleAuth,\n', '');
            content = content.replace('    googleAuthCallback,\n', '');
            content = content.replace('    googleCallback,\n', '');
            content = content.replace('    githubAuth,\n', '');
            content = content.replace('    githubAuthCallback,\n', '');
            content = content.replace('    githubCallback,\n', '');
            content = content.replace(`// OAuth routes - Google\nrouter.get('/google', googleAuth);\nrouter.get('/google/callback', googleAuthCallback, googleCallback);\n\n`, '');
            content = content.replace(`// OAuth routes - GitHub\nrouter.get('/github', githubAuth);\nrouter.get('/github/callback', githubAuthCallback, githubCallback);\n\n`, '');
            await fs.writeFile(routesPath, content);
        }

        // Modify auth controller
        const controllerPath = path.join(projectPath, 'backend', 'src', 'controllers', 'auth.controller.ts');
        if (await fs.pathExists(controllerPath)) {
            let content = await fs.readFile(controllerPath, 'utf-8');
            content = content.replace("import passport from 'passport';\n", '');
            const passportHandlersIndex = content.indexOf('// Passport authentication handlers');
            if (passportHandlersIndex !== -1) {
                content = content.substring(0, passportHandlersIndex);
            }
            await fs.writeFile(controllerPath, content);
        }
    }
}

async function handlePythonOAuth(projectPath, framework, hasOAuth) {
    if (framework === 'fastapi') {
        const requirementsPath = path.join(projectPath, 'backend', 'requirements.txt');
        if (!hasOAuth && await fs.pathExists(requirementsPath)) {
            let content = await fs.readFile(requirementsPath, 'utf-8');
            content = content.split('\n').filter(line => !line.includes('authlib')).join('\n');
            await fs.writeFile(requirementsPath, content);
        }
    } else if (framework === 'django') {
        const requirementsPath = path.join(projectPath, 'backend', 'requirements.txt');
        if (!hasOAuth && await fs.pathExists(requirementsPath)) {
            let content = await fs.readFile(requirementsPath, 'utf-8');
            content = content.split('\n').filter(line => !line.includes('django-allauth')).join('\n');
            await fs.writeFile(requirementsPath, content);
        }
    }
}

async function handleFrontendOAuth(projectPath, framework, hasOAuth) {
    if (framework === 'react') {
        await handleReactOAuth(projectPath, hasOAuth);
    } else if (framework === 'vue') {
        await handleVueOAuth(projectPath, hasOAuth);
    }
    // Add other frameworks as needed
}

async function handleReactOAuth(projectPath, hasOAuth) {
    const loginPath = path.join(projectPath, 'frontend', 'src', 'pages', 'public', 'Login.tsx');
    const signupPath = path.join(projectPath, 'frontend', 'src', 'pages', 'public', 'Signup.tsx');

    for (const pagePath of [loginPath, signupPath]) {
        if (await fs.pathExists(pagePath)) {
            let content = await fs.readFile(pagePath, 'utf-8');

            if (!hasOAuth) {
                // Remove authService import
                content = content.replace("import { authService } from '@/services/auth.service';\n", '');

                // Remove OAuth section
                const dividerStart = content.indexOf('{/* Divider */}');
                if (dividerStart !== -1) {
                    const oauthButtonsStart = content.indexOf('{/* OAuth Buttons */}', dividerStart);
                    if (oauthButtonsStart !== -1) {
                        const gridEnd = content.indexOf('</div>', oauthButtonsStart);
                        if (gridEnd !== -1) {
                            const sectionEnd = gridEnd + '</div>'.length;
                            content = content.substring(0, dividerStart) + content.substring(sectionEnd);
                        }
                    }
                }
            }

            await fs.writeFile(pagePath, content);
        }
    }
}

async function handleVueOAuth(projectPath, hasOAuth) {
    // Similar logic for Vue components
    // Will be implemented for Vue templates
}

async function handleORM(projectPath, config) {
    const { backend } = config;
    const orm = backend.orm;

    if (backend.backendRuntime === 'nodejs') {
        const pkgPath = path.join(projectPath, 'backend', 'package.json');
        if (!await fs.pathExists(pkgPath)) return;

        const pkg = await fs.readJson(pkgPath);

        // Remove all ORM dependencies first
        delete pkg.dependencies['prisma'];
        delete pkg.dependencies['@prisma/client'];
        delete pkg.dependencies['typeorm'];
        delete pkg.dependencies['sequelize'];
        delete pkg.dependencies['mongoose'];
        delete pkg.devDependencies['prisma'];

        // Add selected ORM
        if (orm === 'prisma') {
            pkg.dependencies['@prisma/client'] = '^5.0.0';
            pkg.devDependencies['prisma'] = '^5.0.0';
        } else if (orm === 'typeorm') {
            pkg.dependencies['typeorm'] = '^0.3.0';
            pkg.dependencies['reflect-metadata'] = '^0.1.13';
        } else if (orm === 'sequelize') {
            pkg.dependencies['sequelize'] = '^6.35.0';
        } else if (orm === 'mongoose') {
            pkg.dependencies['mongoose'] = '^8.0.0';
        }

        // Add database drivers
        if (['postgresql', 'mysql'].includes(backend.database)) {
            if (orm === 'prisma' || orm === 'typeorm' || orm === 'sequelize') {
                if (backend.database === 'postgresql') {
                    pkg.dependencies['pg'] = '^8.11.0';
                } else if (backend.database === 'mysql') {
                    pkg.dependencies['mysql2'] = '^3.6.0';
                }
            }
        }

        await fs.writeJson(pkgPath, pkg, { spaces: 2 });

        // Create Prisma schema if needed
        if (orm === 'prisma') {
            await createPrismaSchema(projectPath, backend.database);
        }
    } else if (backend.backendRuntime === 'python') {
        const requirementsPath = path.join(projectPath, 'backend', 'requirements.txt');
        if (!await fs.pathExists(requirementsPath)) return;

        let requirements = await fs.readFile(requirementsPath, 'utf-8');
        const lines = requirements.split('\n').filter(line =>
            !line.includes('sqlalchemy') &&
            !line.includes('motor') &&
            !line.includes('mongoengine') &&
            !line.includes('psycopg2') &&
            !line.includes('pymongo')
        );

        // Add selected ORM
        if (orm === 'sqlalchemy') {
            lines.push('sqlalchemy==2.0.23');
            if (backend.database === 'postgresql') {
                lines.push('psycopg2-binary==2.9.9');
            } else if (backend.database === 'mysql') {
                lines.push('pymysql==1.1.0');
            }
        } else if (orm === 'motor') {
            lines.push('motor==3.3.2');
        } else if (orm === 'mongoengine') {
            lines.push('mongoengine==0.27.0');
        } else if (orm === 'none' && backend.database === 'mongodb') {
            lines.push('pymongo==4.6.1');
        }

        await fs.writeFile(requirementsPath, lines.join('\n'));
    }
}

async function createPrismaSchema(projectPath, database) {
    const prismaDir = path.join(projectPath, 'backend', 'prisma');
    await fs.ensureDir(prismaDir);

    const provider = database === 'postgresql' ? 'postgresql' : database === 'mysql' ? 'mysql' : 'sqlite';

    const schema = `// This is your Prisma schema file
// Learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

    await fs.writeFile(path.join(prismaDir, 'schema.prisma'), schema);
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

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

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
    const frontendFramework = config.frontend?.frontendFramework || 'N/A';
    const backendRuntime = config.backend?.backendRuntime || 'N/A';
    const pythonFramework = config.backend?.pythonFramework || '';
    const database = config.backend?.database || 'N/A';
    const orm = config.backend?.orm || 'N/A';

    const readme = `# ${config.projectName}

A production-ready full-stack application with security best practices.

## 🚀 Tech Stack

${config.frontend ? `### Frontend
- **Framework**: ${frontendFramework.charAt(0).toUpperCase() + frontendFramework.slice(1)}
- **Language**: ${config.frontend.frontendLanguage}
- **Styling**: ${config.frontend.styling}
- **State Management**: ${config.frontend.stateManagement}
` : ''}

${config.backend ? `### Backend
- **Runtime**: ${backendRuntime === 'nodejs' ? 'Node.js (Express)' : `Python (${pythonFramework})`}
- **Database**: ${database}
- **ORM/ODM**: ${orm}
- **Language**: ${config.backend.backendLanguage || 'Python'}
` : ''}

## 📁 Project Structure

\`\`\`
${config.projectName}/
${config.frontend ? `├── frontend/           # ${frontendFramework} application
│   ├── src/
│   └── package.json
` : ''}${config.backend ? `├── backend/            # ${backendRuntime} backend
│   ├── ${backendRuntime === 'python' ? 'app/' : 'src/'}
│   └── ${backendRuntime === 'python' ? 'requirements.txt' : 'package.json'}
` : ''}└── README.md
\`\`\`

## 🛠️ Getting Started

### Prerequisites

- ${config.frontend ? 'Node.js 18+' : ''}
${config.backend && backendRuntime === 'python' ? '- Python 3.10+' : ''}
${config.backend && backendRuntime === 'nodejs' ? '- Node.js 18+' : ''}
- ${database} database

### Installation

${config.backend && backendRuntime === 'python' ? `1. **Set up Python backend:**

   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

2. **Start the backend:**

   \`\`\`bash
   ${pythonFramework === 'fastapi' ? 'uvicorn main:app --reload' : 'python manage.py runserver'}
   \`\`\`
` : ''}

${config.backend && backendRuntime === 'nodejs' ? `1. **Set up Node.js backend:**

   \`\`\`bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

2. **Start the backend:**

   \`\`\`bash
   npm run dev
   \`\`\`
` : ''}

${config.frontend ? `3. **Set up frontend:**

   \`\`\`bash
   cd frontend
   npm install
   cp .env.example .env
   \`\`\`

4. **Start the frontend:**

   \`\`\`bash
   npm run dev
   \`\`\`
` : ''}

## 🔐 Security Features

${config.features.includes('jwtAuth') ? '- JWT Authentication with access/refresh tokens\n' : ''}${config.features.includes('oauth') ? '- OAuth integration (Google, GitHub)\n' : ''}${config.features.includes('emailVerification') ? '- Email verification flow\n' : ''}${config.features.includes('passwordReset') ? '- Password reset functionality\n' : ''}${config.features.includes('rbac') ? '- Role-based access control\n' : ''}${config.features.includes('rateLimiting') ? '- API rate limiting\n' : ''}${config.features.includes('auditLogging') ? '- Audit logging\n' : ''}

## 📄 License

MIT
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
    await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}
