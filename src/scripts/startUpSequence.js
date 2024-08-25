const timeout = 10000


const startUpSequence = function (loaders, finish) {
    var timeouttimer
    function onError(e) {
        window.throwError(e)
    }

    var lastindex = 0
    timeouttimer = setTimeout(() => {
        onError({ message: "System took too long to launch" })
    }, timeout);
    const next = (index) => {
        lastindex = index
        if (index == loaders.length) clearTimeout(timeouttimer)
        if (index >= loaders.length) {
            if (finish) finish();
            return;
        }

        let called = false;

        const nextCallback = () => {
            if (called) return;
            called = true;
            try {
                next(index + 1);
            } catch (error) {
                onError(error)
            }
        };

        const currentLoader = loaders[index];
        currentLoader(nextCallback);
    };

    try {
        next(0);

    } catch (error) {
        onError(error)
    }
};

export default startUpSequence;