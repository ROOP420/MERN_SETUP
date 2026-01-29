#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { createProject } from '../src/index.js';

const packageJson = {
  name: 'create-mern-pro',
  version: '1.0.0',
  description: 'Create production-ready MERN stack applications'
};

program
  .name('create-mern-pro')
  .description(chalk.cyan('🚀 Create production-ready MERN stack applications with TypeScript'))
  .version(packageJson.version)
  .argument('[project-name]', 'Name of the project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--npm', 'Use npm as package manager')
  .option('--yarn', 'Use yarn as package manager')
  .option('--pnpm', 'Use pnpm as package manager')
  .option('--skip-install', 'Skip dependency installation')
  .action(async (projectName, options) => {
    console.log();
    console.log(chalk.bold.cyan('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║') + chalk.bold.white('       🚀 Create MERN Pro - Production MERN Stack          ') + chalk.bold.cyan('║'));
    console.log(chalk.bold.cyan('║') + chalk.gray('       TypeScript • Tailwind • Zustand • OAuth             ') + chalk.bold.cyan('║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝'));
    console.log();

    try {
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
