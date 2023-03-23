import { inspect } from './inspect';
import { catalog } from './catalog';

const dep = process.argv[2];
go();

async function go() {
    const inspection = await inspect(dep);
    catalog(inspection);
}