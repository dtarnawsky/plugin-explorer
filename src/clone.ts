import { join } from "path";
import { runAll } from "./utils";

export async function clone(url: string, folder: string) {
    const path = join('apps', folder);
    await runAll([
        'mkdir -p apps',
        `git clone --depth=1 --branch=main ${url} ./${path}`,
        `rm -rf ${path}/.git`
    ], './');
}