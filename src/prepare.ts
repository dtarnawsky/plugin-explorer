import { readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { readPlugin } from "./catalog.js";
import { Inspection } from "./inspection.js";
import { PluginSummary, Summary } from "./summary.js";
import { readTestHistorySummary, Test } from "./test.js";

enum SummaryFilter {
    All,
    Problem, // Plugins that will not build
    Capacitor3, // Works with Capacitor 3
    Capacitor4, // Works with Capacitor 4
    Capacitor5, // Works with Capacitor 5
    Cordova611 // Works with Cordova iOS 6 and Cordova Android 11
}

export function prepare() {
    console.log(`${reviewList('plugins.json', SummaryFilter.All)} working plugins found.`);
    reviewList('detailed-plugins.json', SummaryFilter.All, true);
    console.log(`${reviewList('problem-plugins.json', SummaryFilter.Problem)} plugins that wont build.`);
    console.log(`${reviewList('cap5-plugins.json', SummaryFilter.Capacitor5)} Capacitor 5 plugins found.`);
    console.log(`${reviewList('cap4-plugins.json', SummaryFilter.Capacitor4)} Capacitor 4 plugins found.`);
    console.log(`${reviewList('cap3-plugins.json', SummaryFilter.Capacitor3)} Capacitor 3 plugins found.`);
    console.log(`${reviewList('cordova6-11-plugins.json', SummaryFilter.Cordova611)} Cordova plugins found.`);
    keywords();
}

function reviewList(filename: string, filter: SummaryFilter, fullDetails?: boolean): number {
    let count = 0;
    const result: Summary = { plugins: [] };
    for (let file of pluginNames()) {
        const summary = review(join(file), filter, fullDetails);
        if (summary) {
            result.plugins.push(summary);
            count++;
        }

    }
    const indent = (filter == SummaryFilter.Problem) ? 2 : 0;
    writeFileSync(join('dist', filename), JSON.stringify(result, undefined, indent), 'utf-8');
    return count;
}

function keywords() {
    const result = [];
    for (let file of pluginNames()) {
        const plugin = filtered(readPluginFromFile(file), SummaryFilter.All);
        if (plugin) {
            if (plugin.keywords) {
                for (const keyword of plugin.keywords) {
                    if (!result.includes(keyword)) {
                        result.push(keyword);
                    }
                }
            } else {
                console.warn(`${file} has missing keywords`);
            }

            writeFileSync(join('dist', 'history', encodeURIComponent(plugin.name) + '.json'), JSON.stringify(readTestHistorySummary(plugin.name), undefined, 2), 'utf-8');
            writeFileSync(join('dist', encodeURIComponent(plugin.name) + '.json'), JSON.stringify(plugin, undefined, 2), 'utf-8');
        }
    }
    result.sort();
    const filename = 'keywords.json';
    writeFileSync(join('dist', filename), JSON.stringify(result, undefined, 2), 'utf-8');
    console.log(`${result.length} keywords found`);
}

function pluginNames(): string[] {
    const files = readdirSync('./data');
    return files.filter((value) => value.endsWith('.json'));
}

function filtered(plugin: Inspection, filter: SummaryFilter): Inspection {
    switch (filter) {
        case SummaryFilter.All: {
            if (plugin.success.length > 0) {
                return plugin;
            }
            break;
        }
        case SummaryFilter.Problem: {
            if (plugin.success.length == 0) {
                plugin.keywords = undefined;
                plugin.description = undefined;
                return plugin;
            }
            break;
        }
        case SummaryFilter.Cordova611: {
            if (plugin.success.includes(Test.cordovaAndroid11) || plugin.success.includes(Test.cordovaIos6)) {
                return plugin;
            }
            break;            
        }
        case SummaryFilter.Capacitor4: {
            if (plugin.success.includes(Test.capacitorIos4) || plugin.success.includes(Test.capacitorAndroid4)) {
                return plugin;
            }
            break;
        }
        case SummaryFilter.Capacitor5: {
            if (plugin.success.includes(Test.capacitorIos5) || plugin.success.includes(Test.capacitorAndroid5)) {
                return plugin;
            }
            break;
        }        
        case SummaryFilter.Capacitor3: {
            if (plugin.success.includes(Test.capacitorIos3) || plugin.success.includes(Test.capacitorAndroid3)) {
                return plugin;
            }
            break;
        }
    }
    return undefined;
}

function review(file: string, filter: SummaryFilter, fullDetails: boolean): PluginSummary {
    const plugin: Inspection = readPluginFromFile(file);
    if (!filtered(plugin, filter)) {
        return undefined;
    }
    if (fullDetails) {
        return (plugin as any);
    }
    return {
        name: plugin.name,
        description: plugin.description,
        keywords: plugin.keywords
    }
}

function readPluginFromFile(file: string): Inspection {
    const name = decodeURIComponent(file.replace('.json', ''));
    return readPlugin(name);
}