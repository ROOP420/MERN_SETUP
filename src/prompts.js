import inquirer from 'inquirer';
import chalk from 'chalk';

export async function getProjectConfig(projectName, options) {
    const questions = [];
    const config = {
        projectName: projectName || 'my-app',
        packageManager: 'npm',
        features: [],
        projectType: 'fullstack',
        frontend: {},
        backend: {},
        database: {},
        initGit: true,
        installDeps: true
    };

    // Project name prompt (if not provided)
    if (!projectName) {
        questions.push({
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            default: 'my-app',
            validate: (input) => {
                if (/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(input)) {
                    return true;
                }
                return 'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores';
            }
        });
    }

    // STEP 1: Project Type Selection
    if (!options.yes) {
        questions.push({
            type: 'list',
            name: 'projectType',
            message: chalk.cyan('What type of project do you want to create?'),
            choices: [
                { name: '🌐 Web Application', value: 'web' },
                { name: '🖥️  Desktop Application', value: 'desktop' },
                { name: '⚡ Backend API Only', value: 'backend' },
                { name: '📊 Admin Dashboard', value: 'admin' },
                { name: '🚀 Full-Stack Application', value: 'fullstack' }
            ],
            default: 'fullstack'
        });
    }

    // Get initial answers to determine what to ask next
    const initialAnswers = questions.length > 0 ? await inquirer.prompt(questions) : {};
    Object.assign(config, initialAnswers);

    const needsFrontend = ['web', 'desktop', 'admin', 'fullstack'].includes(config.projectType);
    const needsBackend = ['backend', 'admin', 'fullstack'].includes(config.projectType);

    const frontendQuestions = [];
    const backendQuestions = [];
    const featureQuestions = [];

    // ============================================================
    // FRONTEND CONFIGURATION (if applicable)
    // ============================================================
    if (needsFrontend && !options.yes) {
        // Frontend Language
        frontendQuestions.push({
            type: 'list',
            name: 'frontendLanguage',
            message: chalk.cyan('Frontend language?'),
            choices: [
                { name: chalk.blue('TypeScript') + chalk.gray(' (recommended)'), value: 'typescript' },
                { name: 'JavaScript', value: 'javascript' }
            ],
            default: 'typescript'
        });

        // Frontend Framework
        frontendQuestions.push({
            type: 'list',
            name: 'frontendFramework',
            message: chalk.cyan('Frontend framework?'),
            choices: [
                { name: chalk.cyan('React') + chalk.gray(' (Vite + Hot Reload)'), value: 'react' },
                { name: chalk.green('Vue 3') + chalk.gray(' (Composition API)'), value: 'vue' },
                { name: chalk.yellow('Next.js') + chalk.gray(' (React with SSR/SSG)'), value: 'nextjs' },
                { name: chalk.red('Angular') + chalk.gray(' (TypeScript only)'), value: 'angular' },
                { name: chalk.magenta('Svelte') + chalk.gray(' (Modern \u0026 Fast)'), value: 'svelte' },
                { name: 'Vanilla (No framework)', value: 'vanilla' }
            ],
            default: 'react'
        });

        // Rendering Model (only for web apps, not for Next.js which has its own)
        frontendQuestions.push({
            type: 'list',
            name: 'renderingModel',
            message: chalk.cyan('Rendering model?'),
            choices: [
                { name: 'CSR (Client-Side Rendering)', value: 'csr' },
                { name: 'SSR (Server-Side Rendering)', value: 'ssr' },
                { name: 'SSG (Static Site Generation)', value: 'ssg' }
            ],
            default: 'csr',
            when: (answers) => {
                return answers.frontendFramework !== 'nextjs' && config.projectType === 'web';
            }
        });

        // Styling Framework
        frontendQuestions.push({
            type: 'list',
            name: 'styling',
            message: chalk.cyan('Styling framework?'),
            choices: [
                { name: chalk.cyan('Tailwind CSS') + chalk.gray(' (utility-first)'), value: 'tailwind' },
                { name: 'CSS Modules', value: 'cssModules' },
                { name: 'Styled Components', value: 'styledComponents' },
                { name: 'Plain CSS', value: 'css' }
            ],
            default: 'tailwind'
        });

        // State Management
        frontendQuestions.push({
            type: 'list',
            name: 'stateManagement',
            message: chalk.cyan('State management?'),
            choices: (answers) => {
                const framework = answers.frontendFramework;
                if (framework === 'vue') {
                    return [
                        { name: chalk.green('Pinia') + chalk.gray(' (recommended for Vue)'), value: 'pinia' },
                        { name: 'Vuex', value: 'vuex' },
                        { name: 'None', value: 'none' }
                    ];
                } else if (framework === 'angular') {
                    return [
                        { name: chalk.red('NgRx') + chalk.gray(' (recommended for Angular)'), value: 'ngrx' },
                        { name: 'None', value: 'none' }
                    ];
                } else {
                    return [
                        { name: chalk.magenta('Zustand') + chalk.gray(' (lightweight)'), value: 'zustand' },
                        { name: 'Redux Toolkit', value: 'redux' },
                        { name: 'None', value: 'none' }
                    ];
                }
            },
            default: (answers) => {
                if (answers.frontendFramework === 'vue') return 'pinia';
                if (answers.frontendFramework === 'angular') return 'ngrx';
                return 'zustand';
            }
        });

        const frontendAnswers = await inquirer.prompt(frontendQuestions);
        config.frontend = frontendAnswers;
    }

    // ============================================================
    // BACKEND CONFIGURATION (if applicable)
    // ============================================================
    if (needsBackend && !options.yes) {
        // Backend Runtime
        backendQuestions.push({
            type: 'list',
            name: 'backendRuntime',
            message: chalk.cyan('Backend runtime?'),
            choices: [
                { name: chalk.green('Node.js') + chalk.gray(' (Express + JavaScript/TypeScript)'), value: 'nodejs' },
                { name: chalk.blue('Python') + chalk.gray(' (FastAPI or Django)'), value: 'python' }
            ],
            default: 'nodejs'
        });

        // Get backend runtime answer first to conditionally ask next questions
        const backendRuntimeAnswer = await inquirer.prompt(backendQuestions);
        config.backend.backendRuntime = backendRuntimeAnswer.backendRuntime;

        const additionalBackendQuestions = [];

        // Python Framework Selection (only if Python is selected)
        if (config.backend.backendRuntime === 'python') {
            additionalBackendQuestions.push({
                type: 'list',
                name: 'pythonFramework',
                message: chalk.cyan('Python framework?'),
                choices: [
                    {
                        name: chalk.cyan('FastAPI') + chalk.gray(' (modern, fast, async)'),
                        value: 'fastapi'
                    },
                    {
                        name: chalk.green('Django') + chalk.gray(' (full-featured, Django REST Framework)'),
                        value: 'django'
                    }
                ],
                default: 'fastapi'
            });
        }

        // Backend Language (only for Node.js)
        if (config.backend.backendRuntime === 'nodejs') {
            additionalBackendQuestions.push({
                type: 'list',
                name: 'backendLanguage',
                message: chalk.cyan('Backend language?'),
                choices: [
                    { name: chalk.blue('TypeScript') + chalk.gray(' (recommended)'), value: 'typescript' },
                    { name: 'JavaScript', value: 'javascript' }
                ],
                default: 'typescript'
            });
        }

        // Database Selection
        additionalBackendQuestions.push({
            type: 'list',
            name: 'database',
            message: chalk.cyan('Database?'),
            choices: [
                { name: chalk.blue('PostgreSQL') + chalk.gray(' (powerful SQL database)'), value: 'postgresql' },
                { name: chalk.cyan('MySQL') + chalk.gray(' (popular SQL database)'), value: 'mysql' },
                { name: chalk.green('MongoDB') + chalk.gray(' (flexible NoSQL)'), value: 'mongodb' },
                { name: chalk.gray('SQLite') + chalk.gray(' (development only)'), value: 'sqlite' }
            ],
            default: 'mongodb'
        });

        const additionalAnswers = await inquirer.prompt(additionalBackendQuestions);
        Object.assign(config.backend, additionalAnswers);

        // ORM/ODM Selection (conditional on database)
        const ormQuestions = [];
        const isSQL = ['postgresql', 'mysql', 'sqlite'].includes(config.backend.database);
        const isMongo = config.backend.database === 'mongodb';
        const isDjango = config.backend.pythonFramework === 'django';
        const isNodeJS = config.backend.backendRuntime === 'nodejs';
        const isPython = config.backend.backendRuntime === 'python';

        if (isSQL) {
            const sqlOrmChoices = [];

            if (isDjango) {
                sqlOrmChoices.push({
                    name: chalk.green('Django ORM') + chalk.gray(' (built-in, recommended for Django)'),
                    value: 'django-orm'
                });
            }

            if (isPython && !isDjango) {
                sqlOrmChoices.push({
                    name: chalk.blue('SQLAlchemy') + chalk.gray(' (powerful Python ORM)'),
                    value: 'sqlalchemy'
                });
            }

            if (isNodeJS) {
                sqlOrmChoices.push(
                    { name: chalk.cyan('Prisma') + chalk.gray(' (modern, type-safe)'), value: 'prisma' },
                    { name: 'TypeORM', value: 'typeorm' },
                    { name: 'Sequelize', value: 'sequelize' }
                );
            }

            sqlOrmChoices.push({ name: 'None (raw SQL queries)', value: 'none' });

            ormQuestions.push({
                type: 'list',
                name: 'orm',
                message: chalk.cyan('ORM for SQL database?'),
                choices: sqlOrmChoices,
                default: isDjango ? 'django-orm' : (isPython ? 'sqlalchemy' : 'prisma')
            });
        } else if (isMongo) {
            const mongoOrmChoices = [];

            if (isNodeJS) {
                mongoOrmChoices.push({
                    name: chalk.green('Mongoose') + chalk.gray(' (elegant MongoDB ODM)'),
                    value: 'mongoose'
                });
            }

            if (isPython) {
                mongoOrmChoices.push(
                    { name: chalk.blue('Motor') + chalk.gray(' (async MongoDB driver)'), value: 'motor' },
                    { name: 'MongoEngine', value: 'mongoengine' }
                );
            }

            mongoOrmChoices.push({ name: 'None (raw MongoDB driver)', value: 'none' });

            ormQuestions.push({
                type: 'list',
                name: 'orm',
                message: chalk.cyan('ODM for MongoDB?'),
                choices: mongoOrmChoices,
                default: isNodeJS ? 'mongoose' : 'motor'
            });
        }

        const ormAnswers = await inquirer.prompt(ormQuestions);
        config.backend.orm = ormAnswers.orm;
    }

    // ============================================================
    // AUTHENTICATION & SECURITY FEATURES
    // ============================================================
    if (!options.yes) {
        featureQuestions.push({
            type: 'checkbox',
            name: 'features',
            message: chalk.cyan('Select authentication \u0026 security features:'),
            choices: [
                new inquirer.Separator(chalk.gray('─── Core Authentication ───')),
                {
                    name: chalk.cyan('🔐 JWT Authentication') +
                        chalk.gray('\n   → Secure token-based auth with access/refresh tokens'),
                    value: 'jwtAuth',
                    checked: true
                },
                {
                    name: chalk.cyan('🌐 OAuth (Google, GitHub)') +
                        chalk.gray('\n   → Social login integration'),
                    value: 'oauth',
                    checked: true
                },
                {
                    name: chalk.cyan('📧 Email Verification') +
                        chalk.gray('\n   → Secure email confirmation with expiring tokens'),
                    value: 'emailVerification',
                    checked: true
                },
                {
                    name: chalk.cyan('🔑 Password Reset') +
                        chalk.gray('\n   → Forgot password flow with secure tokens'),
                    value: 'passwordReset',
                    checked: true
                },
                {
                    name: chalk.cyan('👥 Role-Based Access Control (RBAC)') +
                        chalk.gray('\n   → User roles and permissions system'),
                    value: 'rbac',
                    checked: false
                },
                new inquirer.Separator(chalk.gray('─── Advanced Features ───')),
                {
                    name: chalk.yellow('⚡ Rate Limiting') +
                        chalk.gray('\n   → Protect APIs from abuse (express-rate-limit)'),
                    value: 'rateLimiting',
                    checked: false
                },
                {
                    name: chalk.yellow('📊 Audit Logging') +
                        chalk.gray('\n   → Track user actions for security audits'),
                    value: 'auditLogging',
                    checked: false
                },
                {
                    name: chalk.yellow('🔢 API Versioning') +
                        chalk.gray('\n   → Support multiple API versions (/api/v1, /api/v2)'),
                    value: 'apiVersioning',
                    checked: false
                },
                {
                    name: chalk.yellow('🏥 Health Check Endpoint') +
                        chalk.gray('\n   → /health for load balancers and monitoring'),
                    value: 'healthCheck',
                    checked: false
                },
                {
                    name: chalk.yellow('📧 Email Service') +
                        chalk.gray('\n   → Pre-configured email sending (SMTP/SendGrid)'),
                    value: 'emailService',
                    checked: false
                },
                {
                    name: chalk.yellow('🎚️  Feature Flags') +
                        chalk.gray('\n   → Toggle features without deployments'),
                    value: 'featureFlags',
                    checked: false
                }
            ]
        });

        const featureAnswers = await inquirer.prompt(featureQuestions);
        config.features = featureAnswers.features;
    }

    // ============================================================
    // PACKAGE MANAGER & GIT
    // ============================================================
    const finalQuestions = [];

    // Package manager prompt
    if (!options.npm && !options.yarn && !options.pnpm && !options.yes) {
        finalQuestions.push({
            type: 'list',
            name: 'packageManager',
            message: chalk.cyan('Package manager?'),
            choices: [
                { name: chalk.red('npm') + chalk.gray(' (default)'), value: 'npm' },
                { name: chalk.blue('yarn'), value: 'yarn' },
                { name: chalk.yellow('pnpm'), value: 'pnpm' }
            ],
            default: 'npm'
        });
    }

    if (!options.yes) {
        finalQuestions.push({
            type: 'confirm',
            name: 'initGit',
            message: 'Initialize a git repository?',
            default: true
        });

        if (!options.skipInstall) {
            finalQuestions.push({
                type: 'confirm',
                name: 'installDeps',
                message: 'Install dependencies after creation?',
                default: true
            });
        }
    }

    const finalAnswers = finalQuestions.length > 0 ? await inquirer.prompt(finalQuestions) : {};

    // Merge final answers
    if (finalAnswers.packageManager) {
        config.packageManager = finalAnswers.packageManager;
    } else if (options.npm) {
        config.packageManager = 'npm';
    } else if (options.yarn) {
        config.packageManager = 'yarn';
    } else if (options.pnpm) {
        config.packageManager = 'pnpm';
    }

    if (finalAnswers.initGit !== undefined) {
        config.initGit = finalAnswers.initGit;
    }
    if (finalAnswers.installDeps !== undefined) {
        config.installDeps = finalAnswers.installDeps;
    }

    // Set defaults for --yes mode
    if (options.yes) {
        config.features = ['jwtAuth', 'oauth', 'emailVerification', 'passwordReset'];
        if (!needsFrontend) {
            config.frontend = null;
        } else {
            config.frontend = {
                frontendLanguage: 'typescript',
                frontendFramework: 'react',
                renderingModel: 'csr',
                styling: 'tailwind',
                stateManagement: 'zustand'
            };
        }
        if (!needsBackend) {
            config.backend = null;
        } else {
            config.backend = {
                backendRuntime: 'nodejs',
                backendLanguage: 'typescript',
                database: 'mongodb',
                orm: 'mongoose'
            };
        }
    }

    return config;
}
