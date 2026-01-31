import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { getProjectConfig } from './prompts.js';
import { copyTemplateFiles, updatePackageJson } from './utils/copyTemplate.js';
import { installDependencies } from './utils/installDeps.js';
import { initializeGit } from './utils/gitInit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createProject(projectName, options) {
    // Get project configuration from prompts
    const config = await getProjectConfig(projectName, options);

    const projectPath = path.resolve(process.cwd(), config.projectName);

    // Check if directory already exists
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`\n❌ Directory "${config.projectName}" already exists!`));
        console.log(chalk.gray('   Please choose a different project name or delete the existing directory.\n'));
        process.exit(1);
    }

    // Print configuration summary
    printConfigSummary(config);

    // Step 1: Create project directory
    const createSpinner = ora('Creating project structure...').start();
    try {
        await fs.ensureDir(projectPath);
        if (config.backend) {
            await fs.ensureDir(path.join(projectPath, 'backend'));
        }
        if (config.frontend) {
            await fs.ensureDir(path.join(projectPath, 'frontend'));
        }
        createSpinner.succeed('Project structure created');
    } catch (error) {
        createSpinner.fail('Failed to create project structure');
        throw error;
    }

    // Step 2: Copy template files
    const copySpinner = ora('Copying template files...').start();
    try {
        const templateDir = path.join(__dirname, '..', 'templates');
        await copyTemplateFiles(templateDir, projectPath, config);
        await updatePackageJson(projectPath, config.projectName);
        copySpinner.succeed('Template files copied');
    } catch (error) {
        copySpinner.fail('Failed to copy template files');
        console.error(chalk.red(error.message));
        throw error;
    }

    // Step 3: Create environment files
    const envSpinner = ora('Setting up environment files...').start();
    try {
        await createEnvFiles(projectPath, config);
        envSpinner.succeed('Environment files created');
    } catch (error) {
        envSpinner.fail('Failed to create environment files');
        throw error;
    }

    // Step 4: Set up Python virtual environment (if Python backend)
    if (config.backend && config.backend.backendRuntime === 'python') {
        const pythonSpinner = ora('Setting up Python virtual environment...').start();
        try {
            await setupPythonEnvironment(projectPath, config);
            pythonSpinner.succeed('Python virtual environment created');
        } catch (error) {
            pythonSpinner.warn('Python virtual environment setup skipped (Python may not be installed)');
        }
    }

    // Step 5: Initialize git repository
    if (config.initGit) {
        const gitSpinner = ora('Initializing git repository...').start();
        try {
            await initializeGit(projectPath);
            gitSpinner.succeed('Git repository initialized');
        } catch (error) {
            gitSpinner.warn('Git initialization skipped (git may not be installed)');
        }
    }

    // Step 6: Install dependencies
    if (config.installDeps) {
        console.log();
        await installDependencies(projectPath, config);
    }

    // Success message
    printSuccessMessage(config);
}

async function setupPythonEnvironment(projectPath, config) {
    const backendPath = path.join(projectPath, 'backend');

    // Create virtual environment
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync('python3 -m venv venv', { cwd: backendPath });
}

async function createEnvFiles(projectPath, config) {
    if (config.backend) {
        // Backend .env files
        if (config.backend.backendRuntime === 'nodejs') {
            await createNodeJSEnvFiles(projectPath, config);
        } else if (config.backend.backendRuntime === 'python') {
            await createPythonEnvFiles(projectPath, config);
        }
    }

    if (config.frontend) {
        // Frontend .env files
        await createFrontendEnvFiles(projectPath, config);
    }
}

async function createNodeJSEnvFiles(projectPath, config) {
    const databaseUrl = getDatabaseUrl(config.backend.database);

    const backendEnv = `# Server Configuration
NODE_ENV=development
PORT=8080

# Database
${databaseUrl}

# JWT Secrets (Generate strong random strings for production!)
ACCESS_TOKEN_SECRET=your-access-token-secret-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cookie Settings
COOKIE_SECRET=your-cookie-secret-change-in-production

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Configuration (for email verification & password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

${config.features.includes('oauth') ? `# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
` : ''}`;

    await fs.writeFile(path.join(projectPath, 'backend', '.env'), backendEnv);
    await fs.writeFile(path.join(projectPath, 'backend', '.env.example'), backendEnv);
}

async function createPythonEnvFiles(projectPath, config) {
    const isDjango = config.backend.pythonFramework === 'django';
    const databaseUrl = getDatabaseUrl(config.backend.database);

    const pythonEnv = isDjango ? `# Django Configuration
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production-minimum-50-chars
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
${databaseUrl}

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

${config.features.includes('oauth') ? `# OAuth (django-allauth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
` : ''}` : `# FastAPI Configuration
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# Database
${databaseUrl}

# JWT Settings
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

${config.features.includes('oauth') ? `# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
` : ''}`;

    await fs.writeFile(path.join(projectPath, 'backend', '.env'), pythonEnv);
    await fs.writeFile(path.join(projectPath, 'backend', '.env.example'), pythonEnv);
}

async function createFrontendEnvFiles(projectPath, config) {
    const framework = config.frontend.frontendFramework;
    const prefix = framework === 'nextjs' ? 'NEXT_PUBLIC_' : framework === 'vue' ? 'VUE_APP_' : 'VITE_';

    const frontendEnv = `# API URL
${prefix}API_URL=http://localhost:8080/api

${config.features.includes('oauth') ? `# OAuth
${prefix}GOOGLE_CLIENT_ID=your-google-client-id
${prefix}GITHUB_CLIENT_ID=your-github-client-id
` : ''}`;

    await fs.writeFile(path.join(projectPath, 'frontend', '.env'), frontendEnv);
    await fs.writeFile(path.join(projectPath, 'frontend', '.env.example'), frontendEnv);
}

function getDatabaseUrl(database) {
    switch (database) {
        case 'postgresql':
            return 'DATABASE_URL=postgresql://user:password@localhost:5432/dbname';
        case 'mysql':
            return 'DATABASE_URL=mysql://user:password@localhost:3306/dbname';
        case 'mongodb':
            return 'MONGODB_URI=mongodb://localhost:27017/dbname';
        case 'sqlite':
            return 'DATABASE_URL=sqlite:///./database.db';
        default:
            return 'DATABASE_URL=your-database-url';
    }
}

function printConfigSummary(config) {
    console.log();
    console.log(chalk.cyan('📁 Project:'), chalk.white(config.projectName));
    console.log(chalk.cyan('📦 Type:'), chalk.white(config.projectType));

    if (config.frontend) {
        console.log(chalk.cyan('🎨 Frontend:'), chalk.white(
            `${config.frontend.frontendFramework} (${config.frontend.frontendLanguage})`
        ));
    }

    if (config.backend) {
        const backendLabel = config.backend.backendRuntime === 'python'
            ? `Python (${config.backend.pythonFramework})`
            : `Node.js (${config.backend.backendLanguage})`;
        console.log(chalk.cyan('⚙️  Backend:'), chalk.white(backendLabel));
        console.log(chalk.cyan('🗄️  Database:'), chalk.white(`${config.backend.database} + ${config.backend.orm}`));
    }

    console.log(chalk.cyan('✨ Features:'), chalk.white(config.features.join(', ')));
    console.log();
}

function printSuccessMessage(config) {
    console.log();
    console.log(chalk.green.bold('✅ Project created successfully!'));
    console.log();
    console.log(chalk.white.bold('Next steps:'));
    console.log();
    console.log(chalk.cyan('  1.'), chalk.white(`cd ${config.projectName}`));
    console.log();

    if (config.backend || config.frontend) {
        console.log(chalk.cyan('  2.'), chalk.white('Configure your environment variables:'));
        if (config.backend) {
            console.log(chalk.gray(`     • Update backend/.env with your ${config.backend.database} configuration`));
        }
        if (config.features.includes('oauth')) {
            console.log(chalk.gray('     • Add your OAuth credentials (Google/GitHub)'));
        }
        if (config.features.includes('emailService') || config.features.includes('emailVerification')) {
            console.log(chalk.gray('     • Configure SMTP for email services'));
        }
        console.log();
    }

    console.log(chalk.cyan('  3.'), chalk.white('Start the development servers:'));
    console.log();

    if (config.backend) {
        console.log(chalk.gray('     Backend:'));
        if (config.backend.backendRuntime === 'python') {
            const isDjango = config.backend.pythonFramework === 'django';
            console.log(chalk.white('       cd backend'));
            console.log(chalk.white('       source venv/bin/activate  # On Windows: venv\\Scripts\\activate'));
            console.log(chalk.white('       pip install -r requirements.txt'));
            console.log(chalk.white(`       ${isDjango ? 'python manage.py runserver' : 'uvicorn main:app --reload'}`));
        } else {
            console.log(chalk.white(`       cd backend && ${config.packageManager === 'npm' ? 'npm run' : config.packageManager} dev`));
        }
        console.log();
    }

    if (config.frontend) {
        console.log(chalk.gray('     Frontend:'));
        console.log(chalk.white(`       cd frontend && ${config.packageManager === 'npm' ? 'npm run' : config.packageManager} dev`));
        console.log();
    }

    console.log(chalk.cyan('📖 Documentation:'), chalk.underline('https://github.com/ROOP420/MERN_SETUP'));
    console.log();
    console.log(chalk.magenta('Happy coding! 🎉'));
    console.log();
}
