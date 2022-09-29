import Script from '../../Script';

function MountButton(props) {
    const e = React.createElement;

    const [isMounted, setIsMounted] = React.useState(props.mountAtStart);
    return e(
        'button',
        {
            type: 'button',
            onClick: () => {
                setIsMounted(!isMounted);
                props.onClick();
            },
            className: 'adyen-checkout__button adyen-checkout__button--secondary'
        },
        isMounted ? 'Unmount' : 'Mount'
    );
}

function MockReactComp(props) {
    const e = React.createElement;

    const ref = React.createRef();

    const [isMounted, setIsMounted] = React.useState(false);

    const listenerFn = React.useCallback(
        e => {
            // console.log('### MockReactComp:::: isMounted=', isMounted, 'so...', isMounted ? 'unmount it' : 'mount it');
            if (!isMounted) {
                setIsMounted(true);
                // New mount/unmount/mount fny
                props.docWindow[props.type].mount(ref.current);

                // Old mount/unmount/remount fny
                // if (!props.docWindow[props.type]._node) {
                //     console.log('### MockReactComp:::: first mount');
                //     props.docWindow[props.type].mount(ref.current);
                // } else {
                //     console.log('### MockReactComp:::: second & sub remount');
                //     props.docWindow[props.type].remount();
                // }
            } else {
                setIsMounted(false);
                props.docWindow[props.type].unmount();
                // props.docWindow[props.type]._node = null;
            }
        },
        [isMounted]
    );

    React.useEffect(() => {
        if (props.mountAtStart) {
            setIsMounted(true);
            // New mount/unmount/mount fny
            props.docWindow[props.type].mount(ref.current); // = window.card.mount(ref.current)
        }
    }, []);

    React.useEffect(() => {
        // console.log('### MockReactComp:::: RENDERING isMounted=', isMounted);
    }, [isMounted]);

    return [
        e(MountButton, {
            key: 'mountBtn',
            onClick: listenerFn,
            mountAtStart: props.mountAtStart
        }),
        e('div', { ref, id: 'myReactDiv', key: 'holder', style: { marginTop: '20px' } })
    ];
}

export async function MockReactApp(docWindow, type, domContainer, mountAtStart = true) {
    const script1 = new Script('https://unpkg.com/react@18/umd/react.development.js');
    await script1.load();

    const script2 = new Script('https://unpkg.com/react-dom@18/umd/react-dom.development.js');
    await script2.load();

    const e = React.createElement;
    const root = ReactDOM.createRoot(domContainer);
    root.render(e(MockReactComp, { docWindow, type, mountAtStart }));
}
