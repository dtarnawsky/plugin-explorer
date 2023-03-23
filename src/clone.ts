import { join } from "path";
import { runAll } from "./utils";

export async function clone(url: string, folder: string) {
    const path = join('apps', folder);
    await runAll([
        `git clone --depth=1 --branch=main ${url}`,
        `rm -rf ${path}/.git`
    ], join('apps', folder));
}