import { exec, ExecException } from 'child_process';

export async function runAll(commands: string[], folder: string): Promise<string> {
  let result = '';
  let step = 0;
  for (const command of commands) {
    try {
      result += await getRunOutput(command, folder);
      step++;
    } catch (error) {
      console.error(`Failed to run ${command}`, error);
      throw new Error(
        JSON.stringify({ step, message: `Failed to run ${command}` }));
    }
  }
  return result;
}

export async function getRunOutput(command: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let out = '';
    console.log(`${folder}> ${command}`);
    exec(command, runOptions(command, folder), (error: ExecException, stdout: string, stdError: string) => {
      if (stdout) {
        console.log(stdout);
        out += stdout;
      }
      if (!error) {
        resolve(out);
      } else {
        if (stdError) {
          console.error(stdError);
          reject(stdError);
        } else {
          // This is to fix a bug in npm outdated where it returns an exit code when it succeeds
          resolve(out);
        }
      }
    });
  });
}

function runOptions(command: string, folder: string) {
  const env = { ...process.env };

  // Cocoapods required lang set to en_US.UTF-8 (when capacitor sync or run ios is done)
  if (
    command.includes('sync') ||
    command.includes('capacitor init') ||
    command.includes('cap run ios') ||
    command.includes('npx nx run') ||
    command.includes('cap add') ||
    command.includes('npm run')
  ) {
    env.LANG = 'en_US.UTF-8';
  }

  return { cwd: folder, encoding: 'utf8', env: env };
}