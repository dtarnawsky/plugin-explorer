import { readPlugin } from "./catalog";

export enum FilterType {
    failed
}

export function filter(plugins: string[], filterType: FilterType): string[] {
    const result = [];
    for (const plugin of plugins) {
        const info = readPlugin(plugin);
        let include = false;
        switch (filterType) {
            case FilterType.failed: include = info.fails.length > 0; break;
            default: throw new Error(`Unknown Filter Type ${filterType}`);
        }
        if (include) {
            result.push(plugin);
        }        
    }
    console.log('Failed plugins', result);
    return result;
}