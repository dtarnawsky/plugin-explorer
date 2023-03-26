import { existsSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Inspection } from './inspection.js';
import { Test } from './test.js';
import { hasArg } from './utils.js';

export function catalog(inspection: Inspection) {
    if (inspection.fails.includes(Test.failedInNPM)) {
        removePlugin(inspection.name);
        return;
    }

    // De-duplicate tests
    inspection.fails = [...new Set(inspection.fails)];
    inspection.success = [...new Set(inspection.success)];

    // Save to data folder
    const filename = pluginFilename(inspection.name);
    writeFileSync(filename, JSON.stringify(inspection, null, 2));
    console.log(`Write to ${filename}`);
    console.log(inspection);
}

export function writeErrorLog(plugin: string, test: Test, error: string) {    
    const filename = errorLogFilename(plugin, test);
    writeFileSync(filename, error);
}

export function removeErrorLog(plugin: string, test: Test) {
    const filename = errorLogFilename(plugin, test);
    if (existsSync(filename)) {
        unlinkSync(filename);
    }
}

function removePlugin(plugin: string) {
    if (hasData(plugin)) {
        unlinkSync(pluginFilename(plugin));
    }
}

function errorLogFilename(plugin: string, test: Test) {
    return join('data', 'errors', `${encodeURIComponent(plugin)}-${test}.txt`);
}

export function writePluginList(name: string) {
    let lines = readPluginList();
    if (!lines.includes(name)) {
        lines.push(name);
    }
    lines.sort();
    lines = [...new Set(lines)]; // De-dup
    writeFileSync(pluginListFilename(), lines.join('\n'));
}

export function removeFromPluginList(name: string) {
    const lines = readPluginList();
    if (lines.includes(name)) {
        lines.splice(lines.indexOf(name), 1);
    }
    lines.sort();
    writeFileSync(pluginListFilename(), lines.join('\n'));
}

export function readPluginList(): string[] {
    const filename = pluginListFilename();
    let lines: string[] = [];
    if (existsSync(filename)) {
        lines = readFileSync(filename, 'utf-8').split('\n');
    }
    if (hasArg('reverse', process.argv)) {
        lines.reverse();
    }
    return lines;
}

function pluginListFilename() {
    return join('data', `plugins.txt`);
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
            repo: '',
            author: '',
            published: '',
            versions: [],
            keywords: [],
            fails: []
        }
    }
}