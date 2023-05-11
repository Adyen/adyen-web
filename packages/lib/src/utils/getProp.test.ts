import getProp from './getProp';

const props = {
    user: {
        posts: [
            { title: 'Foo', comments: ['Good one!', 'Interesting...'] },
            { title: 'Bar', comments: ['Ok'] },
            { title: 'Baz', comments: [] }
        ]
    }
};

describe('getProp', () => {
    test('gets a nested property in an object', () => {
        expect(getProp(props, 'user.posts.0.comments')).toEqual(['Good one!', 'Interesting...']);
        expect(getProp(props, 'user.posts.1.comments')).toEqual(['Ok']);
    });

    test('returns undefined if the property does not exist', () => {
        expect(getProp(props, 'user.posts.2.comments.0')).toBe(undefined);
        expect(getProp(props, 'user.cats.2.comments.0')).toBe(undefined);
        expect(getProp(props, 'user.posts.000.comments.0')).toBe(undefined);
        expect(getProp(props, 'cats.posts.0.comments.0')).toBe(undefined);
    });
});
