import { inspect } from './inspect';
import { catalog, readPluginList, removeFromPluginList, writePluginList } from './catalog';
import { clone } from './clone';
import { hasArg } from './utils';
import { filter, FilterType } from './filter';
import { Test } from './inspection';

const args = process.argv;
const dep = args[2];

debugger;
if (hasArg('all', args)) {
    console.log('Inspecting all plugins...');
    go(readPluginList());
} else if (hasArg('failed', args)) {
    console.log('Inspecting failed plugins...');
    go(filter(readPluginList(), FilterType.failed));
} else if (hasArg('new', args)) {
    console.log('Inspecting new plugins...');
    go(filter(readPluginList(), FilterType.new));
} else {
    console.log(`Inspecting ${dep}...`);
    go([dep]);
}

async function go(deps: string[]) {
    for (const dep of deps) {
        await clone('https://github.com/dtarnawsky/plugin-test-capacitor-4.git', 'capacitor-4');
        const inspection = await inspect(dep);
        catalog(inspection);
        const removePlugin = inspection.fails.includes(Test.failedInNPM);
        if (removePlugin) {
            removeFromPluginList(inspection.name);
        } else {
            writePluginList(inspection.name);
        }
    }
}