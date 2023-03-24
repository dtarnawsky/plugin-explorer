import { hasData, readPlugin } from "./catalog.js";

export enum FilterType {
    failed,
    new
}

export function filter(plugins: string[], filterType: FilterType): string[] {
    const result = [];
    for (const plugin of plugins) {
        const info = readPlugin(plugin);
        let include = false;
        switch (filterType) {
            case FilterType.failed: include = info.fails.length > 0; break;
            case FilterType.new: include = !hasData(plugin); break;
            default: throw new Error(`Unknown Filter Type ${filterType}`);
        }
        if (include) {
            result.push(plugin);
        }
    }
    return result;
}