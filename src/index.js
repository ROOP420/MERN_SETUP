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

    console.log();
    console.log(chalk.cyan('📁 Project:'), chalk.white(config.projectName));
    console.log(chalk.cyan('📦 Package Manager:'), chalk.white(config.packageManager));
    console.log(chalk.cyan('✨ Features:'), chalk.white(config.features.join(', ')));
    console.log();

    // Step 1: Create project directory
    const createSpinner = ora('Creating project structure...').start();
    try {
        await fs.ensureDir(projectPath);
        await fs.ensureDir(path.join(projectPath, 'backend'));
        await fs.ensureDir(path.join(projectPath, 'frontend'));
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
        throw error;
    }

    // Step 3: Create environment files
    const envSpinner = ora('Setting up environment files...').start();
    try {
        await createEnvFiles(projectPath);
        envSpinner.succeed('Environment files created');
    } catch (error) {
        envSpinner.fail('Failed to create environment files');
        throw error;
    }

    // Step 4: Initialize git repository
    if (config.initGit) {
        const gitSpinner = ora('Initializing git repository...').start();
        try {
            await initializeGit(projectPath);
            gitSpinner.succeed('Git repository initialized');
        } catch (error) {
            gitSpinner.warn('Git initialization skipped (git may not be installed)');
        }
    }

    // Step 5: Install dependencies
    if (config.installDeps) {
        console.log();
        await installDependencies(projectPath, config.packageManager);
    }

    // Success message
    printSuccessMessage(config);
}

async function createEnvFiles(projectPath) {
    const backendEnv = `# Server Configuration
NODE_ENV=development
PORT=8080

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database-name

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

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
`;

    const frontendEnv = `# API URL
VITE_API_URL=http://localhost:8080/api

# OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
`;

    await fs.writeFile(path.join(projectPath, 'backend', '.env'), backendEnv);
    await fs.writeFile(path.join(projectPath, 'backend', '.env.example'), backendEnv);
    await fs.writeFile(path.join(projectPath, 'frontend', '.env'), frontendEnv);
    await fs.writeFile(path.join(projectPath, 'frontend', '.env.example'), frontendEnv);
}

function printSuccessMessage(config) {
    console.log();
    console.log(chalk.green.bold('✅ Project created successfully!'));
    console.log();
    console.log(chalk.white('Next steps:'));
    console.log();
    console.log(chalk.cyan('  1.'), chalk.white(`cd ${config.projectName}`));
    console.log();
    console.log(chalk.cyan('  2.'), chalk.white('Configure your environment variables:'));
    console.log(chalk.gray('     • Update backend/.env with your MongoDB URI'));
    console.log(chalk.gray('     • Add your OAuth credentials (Google/GitHub)'));
    console.log(chalk.gray('     • Configure SMTP for email verification'));
    console.log();
    console.log(chalk.cyan('  3.'), chalk.white('Start the development servers:'));
    console.log();
    console.log(chalk.gray('     Backend:'));
    console.log(chalk.white(`       cd backend && ${config.packageManager === 'npm' ? 'npm run' : config.packageManager} dev`));
    console.log();
    console.log(chalk.gray('     Frontend:'));
    console.log(chalk.white(`       cd frontend && ${config.packageManager === 'npm' ? 'npm run' : config.packageManager} dev`));
    console.log();
    console.log(chalk.cyan('📖 Documentation:'), chalk.underline('https://github.com/ROOP420/MERN_SETUP'));
    console.log();
    console.log(chalk.magenta('Happy coding! 🎉'));
    console.log();
}
