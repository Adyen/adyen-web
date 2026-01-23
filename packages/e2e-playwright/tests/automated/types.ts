export interface StorybookIndex {
    v: number;
    entries: {
        [id: string]: {
            id: string;
            title: string;
            name: string;
            importPath: string;
            type: 'story' | 'docs';
            tags: string[];
        };
    };
}
