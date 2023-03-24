import { inspect } from './inspect';
import { catalog, readPluginList, writePluginList } from './catalog';
import { clone } from './clone';
import { hasArg } from './utils';
import { filter, FilterType } from './filter';

const args = process.argv;
const dep = args[2];

debugger;
if (hasArg('all', args)) {
    console.log('Inspecting all plugins...');
    go(readPluginList());
} else if (hasArg('failed', args)) {
    console.log('Inspecting failed plugins...');
    go(filter(readPluginList(), FilterType.failed));
} else {
    console.log(`Inspecting ${dep}...`);
    go([dep]);
}

async function go(deps: string[]) {
    for (const dep of deps) {
        await clone('https://github.com/dtarnawsky/plugin-test-capacitor-4.git', 'capacitor-4');
        const inspection = await inspect(dep);
        catalog(inspection);
        writePluginList(inspection.name);
    }
}