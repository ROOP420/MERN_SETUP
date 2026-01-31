import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

export async function installDependencies(projectPath, config) {
    if (config.backend) {
        if (config.backend.backendRuntime === 'python') {
            // Install Python dependencies
            console.log(chalk.cyan('\n📦 Installing Python dependencies...\n'));
            await installPythonDependencies(path.join(projectPath, 'backend'));
        } else {
            // Install Node.js backend dependencies
            console.log(chalk.cyan('\n📦 Installing backend dependencies...\n'));
            await installInDirectory(path.join(projectPath, 'backend'), config.packageManager);
        }
    }

    if (config.frontend) {
        // Install frontend dependencies
        console.log(chalk.cyan('\n📦 Installing frontend dependencies...\n'));
        await installInDirectory(path.join(projectPath, 'frontend'), config.packageManager);
    }
}

function installPythonDependencies(directory) {
    return new Promise((resolve, reject) => {
        const spinner = ora({
            text: 'Running pip install...',
            spinner: 'dots'
        }).start();

        // Check if venv exists
        const venvPath = path.join(directory, 'venv');
        const pipCommand = process.platform === 'win32'
            ? path.join(venvPath, 'Scripts', 'pip')
            : path.join(venvPath, 'bin', 'pip');

        // Use venv pip if exists, otherwise use system pip
        const command = fs.existsSync(pipCommand) ? pipCommand : 'pip';
        const args = ['install', '-r', 'requirements.txt'];

        const child = spawn(command, args, {
            cwd: directory,
            stdio: 'pipe',
            shell: true
        });

        let output = '';

        child.stdout?.on('data', (data) => {
            output += data.toString();
        });

        child.stderr?.on('data', (data) => {
            output += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                spinner.succeed('Python dependencies installed');
                resolve();
            } else {
                spinner.fail('Failed to install Python dependencies');
                console.error(chalk.gray(output));
                reject(new Error(`pip install failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            spinner.fail('Failed to run pip');
            console.log(chalk.yellow('⚠️  Please install dependencies manually:'));
            console.log(chalk.gray('   cd backend'));
            console.log(chalk.gray('   pip install -r requirements.txt'));
            resolve(); // Don't reject, allow project to finish
        });
    });
}

function installInDirectory(directory, packageManager) {
    return new Promise((resolve, reject) => {
        const command = packageManager;
        const args = ['install'];

        const spinner = ora({
            text: `Running ${packageManager} install...`,
            spinner: 'dots'
        }).start();

        const child = spawn(command, args, {
            cwd: directory,
            stdio: 'pipe',
            shell: true
        });

        let output = '';

        child.stdout?.on('data', (data) => {
            output += data.toString();
        });

        child.stderr?.on('data', (data) => {
            output += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                spinner.succeed(`Dependencies installed in ${path.basename(directory)}`);
                resolve();
            } else {
                spinner.fail(`Failed to install dependencies in ${path.basename(directory)}`);
                console.error(chalk.gray(output));
                reject(new Error(`${packageManager} install failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            spinner.fail(`Failed to run ${packageManager}`);
            reject(error);
        });
    });
}
