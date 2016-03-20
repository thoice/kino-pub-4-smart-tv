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

window.webapis = window.webapis || {};
window.webapis.avplay = window.webapis.avplay || {};
AVPlay = {
    init: function(initOptions) {
        AVPlay.initOptions = initOptions;
    },
    open: function(url) {
        AVPlay.url = url;
    },
    play: function(successCB, errorCB) {
        var p = document.getElementById(AVPlay.initOptions.containerID);
        widgetAPI.putInnerHTML(p, '');
        var v = document.createElement('video');
        v.id = 'video_element';
        v.width = AVPlay.initOptions.displayRect.width ;
        v.height = AVPlay.initOptions.displayRect.height;
        v.style.position = 'absolute';
        v.style.top = 0;
        v.style.left = 0;
        v.src = AVPlay.url;
        v.controls = true;
        v.autoplay = 'auto';
        p.appendChild(v);
        successCB();
    },
    destroy: function(){
        var videoElement = document.getElementById('video_element');
        videoElement.pause();
        videoElement.src ="";
        videoElement.load();
    }
};
window.webapis.avplay.getAVPlay = window.webapis.avplay.getAVPlay || function (successCB, errorCB) {
        successCB(AVPlay);
    };