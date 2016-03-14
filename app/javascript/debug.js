window.log = function (msg, type) {
    type = type || 'warn';
    switch (type) {
        case 'warn':
            console.log(msg);
            break;
        case 'error':
            console.error(msg);
            break;
    }
};

onerror = function (message, file, line) {
    log(message, file, line);
};


window.curWidget = window.curWidget || {
        //id: 'sstv-kino.pub',
        id: 'kino-pub-4-smart-tv-2',
        height: 720
    };