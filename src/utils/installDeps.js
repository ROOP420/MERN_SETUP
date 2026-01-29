import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function installDependencies(projectPath, packageManager) {
    // Install backend dependencies
    console.log(chalk.cyan('\n📦 Installing backend dependencies...\n'));
    await installInDirectory(path.join(projectPath, 'backend'), packageManager);

    // Install frontend dependencies
    console.log(chalk.cyan('\n📦 Installing frontend dependencies...\n'));
    await installInDirectory(path.join(projectPath, 'frontend'), packageManager);
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
