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
        lines = lines.reverse();
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
        return cleanupPlugin(JSON.parse(json));
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
            platforms: [],
            fails: []
        }
    }
}

function cleanupPlugin(i: Inspection): Inspection {
    // Identity Vault has no keywords
    if (i.name == '@ionic-enterprise/identity-vault') {
        i.keywords = [
            "fingerprint",
            "authentication",
            "biometric",
            "biometrics",
            "faceid",
            "touchid",
            "face",
            "touch",
            "encryption"
        ];
    }

    i.keywords = cleanupKeywords(i.keywords);
    if (i.name?.startsWith('@capacitor/') || i.name?.startsWith('@ionic-enterprise/')) {
        i.author = 'Ionic';
        if (!i.image) {
            i.image = 'https://avatars.githubusercontent.com/u/3171503?v=4';
        }
    }
    return i;
}

// Remove keywords that add no meaning to a search
function cleanupKeywords(keywords: string[]): string[] {
    if (!keywords) return [];

    const result = [];
    for (let word of keywords) {
        if (word.includes('-')) {
            const parts = word.split('-');
            result.push(word.replace(/-/g, ' ').toLowerCase());
            for (const part of parts) {
                result.push(part.toLowerCase());
            }
        } else {
            result.push(word.toLowerCase());
        }
    }
    const words = result.filter(
        (keyword: string) =>
            ![
                'cordova',
                'javascript',
                'mobile',
                'typescript',
                'plugin',
                'capacitor',
                'mobile',
                'ecosystem:cordova',
                'capacitor plugin',
                'capacitor plugins',
                'ios',
                'package',
                'cordova windows',
                'cordova browser',
                'csharp',
                'java',
                'library',
                'ecosystem:phonegap',
                'nodejs',
                'react',
                'electron',
                'blackberry',
                'blackberry10',
                'react native',
                'community',
                'vue',
                'windows',
                'cordova electron',
                'cordova osx',
                'cplusplus',
                'objective c',
                'ionic plugin',
                'objective',
                'c',
                'osx',
                'android',
                'umd',
                'cross platform',
                'phonegap',
                'ionic',
                'capacitorjs',
                'swift',
                'java',
                'angular',
                'capacitor ios',
                'capacitor android',
                'cordova plugin',
                'cordova:plugin',
                'native',
                'capacitor community',
                'cordova ios',
                'cordova android',
            ].includes(keyword.toLowerCase())
    );
    return [...new Set(words)];
}