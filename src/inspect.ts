import { runAll, run } from './utils.js';
import { Inspection } from './inspection.js';
import { Test, TestInfo, setTestHistory } from './test.js';
import { NPMView } from './npm-view.js';
import { writeErrorLog, readPlugin, removeErrorLog } from './catalog.js';
import { inspectGitHubAPI } from './github.js';
import { join } from 'path';
import { Failure } from './failures.js';
import { inspectNpmAPI } from './npm-stat.js';
import { FilterType } from './filter.js';
import { clone } from './clone.js';

export async function inspect(plugin: string, info: TestInfo, filterType: FilterType): Promise<Inspection> {
    const result: Inspection = readPlugin(plugin);
    const folder = join('apps', info.folder);
    const failure: Failure = await prepareProject(plugin, folder, result, info);
    if (failure == Failure.alreadyTested) {
        console.log(`${plugin} ${result.version} wont be tested for ${info.ios},${info.android} as it has been tested already`);
        return result;
    }
    if (failure == Failure.npmMissing) {
        result.fails = [Test.failedInNPM];
        return result;
    }

    if (filterType == FilterType.failed || filterType == FilterType.missing) {
        if (result.success.includes(info.android)) {
            info.android = Test.noOp;
        }
        if (result.success.includes(info.ios)) {
            info.ios = Test.noOp;
        }
    }

    if (!failure) {
        await testProject(plugin, folder, result, 'android', info.android);
        await testProject(plugin, folder, result, 'ios', info.ios);
        await cleanupProject(plugin, folder);
    } else {
        result.fails.push(info.ios);
        result.fails.push(info.android);
        setTestHistory(result.name, { test: info.ios, version: result.version, failure, success: false });
        setTestHistory(result.name, { test: info.android, version: result.version, failure, success: false });
    }
    return result;
}

// This returns false only if the plugin could not be found
async function prepareProject(plugin: string, folder: string, result: Inspection, test: TestInfo): Promise<Failure | undefined> {
    try {
        const priorVersion = result.version;
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

        if (result.version == priorVersion) {
            if ((test.ios in result.success || test.ios in result.fails) &&
                (test.android in result.success || test.android in result.fails)) {
                return Failure.alreadyTested;
            }
        }
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
    await clone(test);
    let failure = await tryRun(['npm ci'], Failure.npmInstall, folder);
    if (!failure) {
        let cmd = '';
        if (testIsCordova(test.ios)) {
            cmd = `npx ionic cordova plugin add ${plugin}@${result.version}`;
        } else {
            cmd = `npm install ${plugin}@${result.version} --save-dev`;
        }
        failure = await tryRun([cmd], Failure.peer, folder);
    }
    if (!failure) {
        const commands = ['npx ionic build'];
        if (!testIsCordova(test.ios)) commands.push('npx cap sync');
        failure = await tryRun(commands, Failure.sync, folder);
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
        if (test == Test.noOp) {
            return;
        }
        console.log(`Testing ${test} ${plugin}@${result.version}`);
        let args = '';
        if (platform == 'android') {
            args = ' --keystorepath="keys/Untitled" --keystorepass="password" --keystorealias="key0" --keystorealiaspass="password" --androidreleasetype="AAB"';
        }
        const buildCmd = testIsCordova(test) ?
            `npx ionic cordova build ${platform}` :
            `npx cap build ${platform}${args}`;
        await runAll([buildCmd], folder);
        storeResult(test, result);

    } catch (error) {
        console.error(`Failed ${platform} build for ${plugin}`);
        storeResult(test, result, error);
    }
}

function testIsCordova(test: Test): boolean {
    return test == Test.cordovaAndroid11 || test == Test.cordovaIos6;
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


    setTestHistory(result.name, { test: test, version: result.version, failure: error ? Failure.build : undefined, success: !error });
}