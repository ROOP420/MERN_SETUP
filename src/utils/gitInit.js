import { spawn } from 'child_process';

export function initializeGit(projectPath) {
    return new Promise((resolve, reject) => {
        const child = spawn('git', ['init'], {
            cwd: projectPath,
            stdio: 'pipe',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`git init failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}
