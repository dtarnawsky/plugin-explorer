import { runAll, run } from './utils.js';
import { Inspection } from './inspection.js';
import { Test, TestInfo } from './test.js';
import { NPMView } from './npm-view.js';
import { writeErrorLog, readPlugin, removeErrorLog } from './catalog.js';
import { inspectGitHubAPI } from './github.js';
import { join } from 'path';
import { Failure } from './failures.js';
import { inspectNpmAPI } from './npm-stat.js';

export async function inspect(plugin: string, info: TestInfo): Promise<Inspection> {
    const result: Inspection = readPlugin(plugin);
    const folder = join('apps', info.folder);
    const failure: Failure = await prepareProject(plugin, folder, result);
    if (failure == Failure.npmMissing) {
        result.fails = [Test.failedInNPM];
        return result;
    }
    if (!failure) {
        await testProject(plugin, folder, result, 'android', info.android);
        await testProject(plugin, folder, result, 'ios', info.ios);
        await cleanupProject(plugin, folder);
    } else {
        result.fails.push(info.ios);
        result.fails.push(info.android);
    }
    return result;
}

// This returns false only if the plugin could not be found
async function prepareProject(plugin: string, folder: string, result: Inspection): Promise<Failure | undefined> {
    try {
        // Get Latest Plugin version number
        const v: NPMView = JSON.parse(await run(`npm view ${plugin} --json`, folder));
        result.version = v.version;
        result.versions = v.versions;
        result.author = v.author;
        result.description = v.description;
        result.bugs = v.bugs?.url;
        result.published = v.time?.modified;
        result.repo = cleanUrl(v.repository?.url);
        result.keywords = v.keywords;
    } catch (error) {
        console.error(`Failed preparation of ${folder} for ${plugin}`, error);
        return Failure.npmMissing;
    }

    try {
        if (result.repo?.includes('github.com')) {
            await inspectGitHubAPI(result);
        }
        await inspectNpmAPI(result);
    } catch (e) {
        console.error(`Failed preparation of ${folder} for ${plugin}`);
    }
    let failure = await tryRun(['npm i'], Failure.npmInstall, folder);
    if (!failure) {
        failure = await tryRun([`npm i ${plugin}@${result.version} --save-dev`], Failure.peer, folder);
    }
    if (!failure) {
        failure = await tryRun(['npx ionic build', 'npx cap sync'], Failure.sync, folder);
    }
    return failure;
}

async function tryRun(commands: string[], failure: Failure, folder: string): Promise<Failure | undefined> {
    try {
        await runAll(commands, folder);
        return undefined
    } catch (e) {
        console.error(`${failure}: Failed preparation of ${folder}`);
        return failure;
    }
}

function cleanUrl(url: string): string {
    if (url) {
        return url.replace('git+', '');
    }
    return url;
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