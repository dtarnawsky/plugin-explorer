import { inspect } from './inspect';
import { catalog, readPluginList, writePluginList } from './catalog';
import { clone } from './clone';

const dep = process.argv[2];
if (dep == 'all') {
    go(readPluginList());
} else {
    go([dep]);
}

async function go(deps: string[]) {
    await clone('https://github.com/dtarnawsky/plugin-test-capacitor-4.git','capacitor-4');
    for (const dep of deps) {
        const inspection = await inspect(dep);
        catalog(inspection);
        writePluginList(inspection.name);
    }
}