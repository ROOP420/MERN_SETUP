import inquirer from 'inquirer';
import chalk from 'chalk';

export async function getProjectConfig(projectName, options) {
    const questions = [];

    // Project name prompt (if not provided)
    if (!projectName) {
        questions.push({
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            default: 'my-mern-app',
            validate: (input) => {
                if (/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(input)) {
                    return true;
                }
                return 'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores';
            }
        });
    }

    // Package manager prompt
    if (!options.npm && !options.yarn && !options.pnpm && !options.yes) {
        questions.push({
            type: 'list',
            name: 'packageManager',
            message: 'Which package manager would you like to use?',
            choices: [
                { name: chalk.red('npm') + chalk.gray(' (default)'), value: 'npm' },
                { name: chalk.blue('yarn'), value: 'yarn' },
                { name: chalk.yellow('pnpm'), value: 'pnpm' }
            ],
            default: 'npm'
        });
    }

    // Additional features prompt
    if (!options.yes) {
        questions.push({
            type: 'checkbox',
            name: 'features',
            message: 'Select additional features:',
            choices: [
                { name: 'Email verification', value: 'emailVerification', checked: true },
                { name: 'Password reset', value: 'passwordReset', checked: true },
                { name: 'Google OAuth', value: 'googleOAuth', checked: true },
                { name: 'GitHub OAuth', value: 'githubOAuth', checked: true },
                { name: 'Docker support', value: 'docker', checked: false },
                { name: 'API documentation (Swagger)', value: 'swagger', checked: false }
            ]
        });

        questions.push({
            type: 'confirm',
            name: 'initGit',
            message: 'Initialize a git repository?',
            default: true
        });

        if (!options.skipInstall) {
            questions.push({
                type: 'confirm',
                name: 'installDeps',
                message: 'Install dependencies after creation?',
                default: true
            });
        }
    }

    // Get answers
    const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

    // Merge with defaults and options
    return {
        projectName: projectName || answers.projectName || 'my-mern-app',
        packageManager: options.npm ? 'npm' : options.yarn ? 'yarn' : options.pnpm ? 'pnpm' : answers.packageManager || 'npm',
        features: answers.features || ['emailVerification', 'passwordReset', 'googleOAuth', 'githubOAuth'],
        initGit: options.yes ? true : answers.initGit ?? true,
        installDeps: options.skipInstall ? false : (options.yes ? true : answers.installDeps ?? true)
    };
}
