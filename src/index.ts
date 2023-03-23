import { inspect } from './inspect';
import { catalog, readPluginList, writePluginList } from './catalog';

const dep = process.argv[2];
if (dep == 'all') {
    go(readPluginList());
} else {
    go([dep]);
}

async function go(deps: string[]) {
    for (const dep of deps) {
        const inspection = await inspect(dep);
        catalog(inspection);
        writePluginList(inspection.name);
    }
}