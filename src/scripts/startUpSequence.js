const timeout = 10000

const startUpSequence = function (loaders, finish) {
    var timeouttimer
    function onError(e) {
        clearTimeout(timeouttimer)
       // console.error(e.message)
        try {
            const loader = document.getElementById("loader")
            loader.style.backgroundColor = "red"
            loader.style.justifyContent = "start"
            loader.style.paddingLeft = "30px"
            loader.innerText = ":(\nOh no!\n"
            loader.innerHTML += "<span class='errormessage'></span>"
            const errormessage = loader.querySelector(".errormessage")
            errormessage.style.display = "contents"
            errormessage.style.fontSize = "30px"
            errormessage.innerText = e.message
        } catch (error) {
            alert(":(\nOh no!\n" + e.message)
        }
        throw e;
        
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