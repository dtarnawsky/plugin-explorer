import { join } from "path";
import { TestInfo } from "./test.js";
import { runAll } from "./utils.js";

export async function clone(info: TestInfo) {
    const path = join('apps', info.folder);
    await runAll([
        'mkdir -p apps',
        `rm -rf ${path}`,
        `git clone --depth=1 --branch=main ${info.git} ./${path}`,
        `rm -rf ${path}/.git`
    ], './');
}