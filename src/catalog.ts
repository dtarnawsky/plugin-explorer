import { existsSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Inspection, Test } from './inspection';

export function catalog(inspection: Inspection) {
    // Save to data folder
    const filename = pluginFilename(inspection.name);
    writeFileSync(filename, JSON.stringify(inspection, null, 2));
    console.log(`Write to ${filename}`);
    console.log(inspection);
}

export function writeErrorLog(plugin: string, test: Test, error: string) {
    console.log(error);
    const filename = errorLogFilename(plugin, test);
    writeFileSync(filename, error);
}

export function removeErrorLog(plugin: string, test: Test) {
    const filename = errorLogFilename(plugin, test);
    if (existsSync(filename)) {
        unlinkSync(filename);
    }
}

function errorLogFilename(plugin: string, test: Test) {
    return join('data', `${encodeURIComponent(plugin)}-${test}.txt`);
}

export function writePluginList(name: string) {
    const filename = join('data', `plugins.txt`);
    let lines: string[] = [];
    if (existsSync(filename)) {
        lines = readFileSync(filename, 'utf-8').split('\n');
    }
    if (!lines.includes(name)) {
        lines.push(name);
    }
    lines.sort();
    writeFileSync(filename, lines.join('\n'));
}

export function readPluginList(): string[] {
    const filename = join('data', `plugins.txt`);
    let lines: string[] = [];
    if (existsSync(filename)) {
        lines = readFileSync(filename, 'utf-8').split('\n');
    }
    return lines;
}

export function pluginFilename(plugin: string): string {
    return join('data', `${encodeURIComponent(plugin)}.json`);
}

export function hasData(plugin: string): boolean {
    return existsSync(pluginFilename(plugin));
}

export function readPlugin(plugin: string): Inspection {
    const filename = pluginFilename(plugin);
    if (existsSync(filename)) {
        const json = readFileSync(filename, 'utf-8');
        return JSON.parse(json);
    } else {
        return {
            name: plugin,
            version: '',
            success: [],
            fails: []
        }
    }
}