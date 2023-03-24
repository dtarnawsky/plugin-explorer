import { join } from "path";
import { runAll } from "./utils.js";

export async function clone(url: string, folder: string) {
    const path = join('apps', folder);
    await runAll([
        'mkdir -p apps',
        `rm -rf ${path}`,
        `git clone --depth=1 --branch=main ${url} ./${path}`,
        `rm -rf ${path}/.git`
    ], './');
}