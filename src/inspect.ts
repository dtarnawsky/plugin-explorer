import { runAll, run } from './utils';
import { Inspection, Test } from './inspection';
import { writeErrorLog, readPlugin, removeErrorLog } from './catalog';

export async function inspect(dep: string): Promise<Inspection> {
    const result: Inspection = readPlugin(dep);
    const folder = 'apps/capacitor-4';
    const foundPlugin = await prepareProject(dep, folder, result);
    if (!foundPlugin) {
        result.fails = [Test.failedInNPM];
        return result;
    }
    await testProject(dep, folder, result, 'android', Test.capacitorAndroid4);
    await testProject(dep, folder, result, 'ios', Test.capacitorIos4);
    await cleanupProject(dep, folder);
    return result;
}

// This returns false only if the plugin could not be found
async function prepareProject(plugin: string, folder: string, result: Inspection): Promise<boolean> {
    try {
        // Get Latest Plugin version number
        const v = await run(`npm view ${plugin} version`, folder);
        result.version = v.replace('\n', '');
    } catch (error) {
        console.error(`Failed preparation of ${folder} for ${plugin}`, error);
        return false;
    }
    try {

        await runAll([
            'npm i',
            `npm i ${plugin}@${result.version} --save-dev`,
            'npx ionic build --prod',
            'npx cap sync',
        ], folder);
    } catch (e) {
        console.error(`Failed preparation of ${folder} for ${plugin}`);        
    }
    return true;
}

async function cleanupProject(plugin: string, folder: string): Promise<void> {
    try {
        // Uninstall Plugin
        await run(`npm uninstall ${plugin}`, folder);
    } catch {
        console.error(`Failed clean up of ${folder} for ${plugin}`);
    }
}

async function testProject(plugin: string, folder: string, result: Inspection, platform: string, test: Test): Promise<void> {
    try {
        console.log(`Testing ${test} ${plugin}@${result.version}`);
        let args = '';
        if (platform == 'android') {
            args = ' --keystorepath="keys/Untitled" --keystorepass="password" --keystorealias="key0" --keystorealiaspass="password" --androidreleasetype="AAB"';
        }
        await runAll(
            [
                `npx cap build ${platform}${args}`
            ],
            folder);
        storeResult(test, result);

    } catch (error) {
        console.error(`Failed ${platform} build for ${plugin}`);
        storeResult(test, result, error);
    }

}

function storeResult(test: Test, result: Inspection, error?: any) {
    if (!error) {
        if (!result.success.includes(test)) {
            result.success.push(test);
        }

        removeErrorLog(result.name, test);

        if (result.fails.includes(test)) {
            result.fails.splice(result.fails.indexOf(test));
        }
    } else {
        if (!result.fails.includes(test)) {
            result.fails.push(test);
        }
        if (result.success.includes(test)) {
            result.success.splice(result.success.indexOf(test));
        }
        writeErrorLog(result.name, test, error);
    }
}