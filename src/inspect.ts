import { runAll, run } from './utils';
import { Inspection, Test } from './inspection';
import { writeErrorLog } from './catalog';

export async function inspect(dep: string): Promise<Inspection> {
    const result: Inspection =
    {
        name: dep,
        version: '',
        success: [],
        fails: []
    }
    const folder = 'apps/capacitor-4';
    await prepareProject(dep, folder, result);
    await testProject(dep, folder, result, 'android', Test.capacitorAndroid4);
    await testProject(dep, folder, result, 'ios', Test.capacitorIos4);
    await cleanupProject(dep, folder);
    return result;
}

async function prepareProject(dep: string, folder: string, result: Inspection): Promise<void> {
    try {
        // Get Latest Plugin version number
        const v = await run(`npm view ${dep} version`, folder);
        result.version = v.replace('\n', '');
        await runAll([
            'npm i',
            `npm i ${dep}@${result.version} --save-dev`,
            'npx ionic build --prod',
            'npx cap sync',
        ], folder);
    } catch (e) {
        console.error(`Failed preparation of ${folder} for ${dep}`);
    }
}

async function cleanupProject(dep: string, folder: string): Promise<void> {
    try {
        // Uninstall Plugin
        await run(`npm uninstall ${dep}`, folder);
    } catch {
        console.error(`Failed clean up of ${folder} for ${dep}`);
    }
}

async function testProject(dep: string, folder: string, result: Inspection, platform: string, test: Test): Promise<void> {
    try {
        console.log(`Testing ${test} ${dep}@${result.version}`);
        let args = '';
        if (platform == 'android') {
            args = ' --keystorepath="keys/Untitled" --keystorepass="password" --keystorealias="key0" --keystorealiaspass="password" --androidreleasetype="AAB"';
        }
        await runAll(
            [
                `npx cap build ${platform}${args}`
            ],
            folder);
        result.success.push(test);

    } catch (error) {
        console.error(`Failed ${platform} build for ${dep}`);
        result.fails.push(test);
        writeErrorLog(result.name, result.version, test, error);
    }

}