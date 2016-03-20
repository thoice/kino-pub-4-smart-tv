Player = {
    // this.footerHtml = '<div class="footer-group"><img class="footer-icon" src="./res/rew_ff.png"><span class="footer-text"> = &plusmn; 10c</span></div> '
    //     + '<div class="footer-group"><img class="footer-icon" src="./res/up_down.png"><span class="footer-text"> = &plusmn; 30c</span></div> '
    //     + '<div class="footer-group"><img class="footer-icon" src="./res/left_right.png"><span class="footer-text"> = &plusmn; 2м</span></div>';
    id: 'player_wrapper',
    url: '',
    totalSeconds: -1,
    // this.e = document.getElementById(id);
    bInited: false,
    dimensions: {
        width: 1280,
        height: 720
    },
    AVPlay: null,
    timeoutId: -1,
    bufferingCB: {
        onbufferingstart: function () {
            log("onbufferingstart");
            // console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = 0;
            playerScene.updateBufferingInfo();
            playerScene.showOverlay();
        },
        onbufferingprogress: function (percent) {
            log("onbufferingprogress");
            // console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = percent;
            playerScene.updateBufferingInfo();
            playerScene.showOverlay();
        },
        onbufferingcomplete: function () {
            log("onbufferingcomplete");
            // console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = 100;
            playerScene.updateBufferingInfo();
            playerScene.timeoutId = setTimeout(playerScene.hideOverlay, 3000);
        }
    },

    playCB: {
        oncurrentplaytime: function (time) {
            log("oncurrentplaytime " + time);
            var playerScene = Main.getScene('player_scene');
            playerScene.curSeconds = time.millisecond / 1000;
            playerScene.updateTimeInfo();
        },
        onresolutionchanged: function (width, height) {
            log("resolution changed : " + width + ", " + height);
        },
        onstreamcompleted: function () {
            log("streaming completed");
        },
        onerror: function (error) {
            log(error.name);
        }
    },

    onShow: function () {
        // todo implement?
        // document.getElementById('footer_wrapper').classList.add('extended-footer');
        // document.getElementById('footer_progress_bar').classList.remove('hidden');
        // var player = Main.getScene('player_scene');
        // var footer = document.getElementById('footer');
        // widgetAPI.putInnerHTML(footer, player.footerHtml);
    },

    showAndPlay: function (e) {
        if (!e || !e.l || !e.l.dataset) {
            // todo throw error?
            return false;
        }
        Main.addScene(Player.id, Player);
        Main.showScene('player_wrapper');
        var data = e.l.dataset;

        var url = data['url'];
        var duration = data['duration'];
        log('Player.showAndPlay');
        //todo spinner
        // Main.showSpinner('Картинка готовится');
        Player.play(url, duration);
    },

    onHide: function () {
        Player.AVPlay.destroy();
        // todo implement?
        // document.getElementById('footer_wrapper').classList.remove('extended-footer');
        // document.getElementById('footer_progress_bar').classList.add('hidden');
        // var playerScene = Main.getScene('player_scene');
        // playerScene.showOverlay();
        // if (Player.timeoutId != -1) {
        //     clearTimeout(Player.timeoutId);
        // }
        // var statusElement = document.getElementById('header_status');
        // widgetAPI.putInnerHTML(statusElement, '');
    },

    play: function (url, duration) {
        this.url = url;
        this.totalSeconds = duration;
        try {
            Player.init();
            Player.AVPlay.open(url);
            Player.AVPlay.play(Player.successCB, Player.errorCB);
        } catch (e) {
            log('Player.play failed');
            log(e.message);
        }
    },

    init: function () {
        var result = true;
        if (Player.bInited !== true) {
            try {
                webapis.avplay.getAVPlay(this.getAVPlaySuccess, this.getAVPlayError);
                var initOptions = {
                    containerID: 'player_container',
                    bufferingCallback: Player.bufferingCB,
                    playCallback: Player.playCB,
                    displayRect: {
                        top: 0,
                        left: 0,
                        width: Player.dimensions.width,
                        height: Player.dimensions.height
                    },
                    autoRatio: true,
                    zIndex: 1
                };
                Player.AVPlay.init(initOptions);
            } catch (e) {
                log('ERROR Player.init');
                log(e);
                result = false;
            }
        }
        return result;
    },

    getAVPlaySuccess: function (avplay) {
        this.bInited = true;
        log('Getting avplay object successfully');
        Player.AVPlay = avplay;
    },

    getAVPlayError: function (a, b, c, d, e) {
        log('ERROR: Player.getAVPlayerror. a,b,c,d,e');
        console.dir([a, b, c, d, e]);
    },

    successCB: function () {
        log('Player.successCB');
        var p = Player;
        document.getElementById('player_container')
            .children[p.AVPlay.id]
            .addEventListener('mousemove', p.mouseMoved);
    },

    errorCB: function (a, b, c, d, e) {
        log('Player.errorCB');
        log([a, b, c, d, e]);
    },

    mouseMoved: function () {
        var playerScene = Main.getScene('player_scene');
        playerScene.showOverlay();
        if (playerScene.timeoutId != -1) {
            clearTimeout(playerScene.timeoutId);
        }
        playerScene.timeoutId = setTimeout(playerScene.hideOverlay, 3000);
    },

    updateTimeInfo: function () {
        var p = Main.getScene('player_scene');
        var progressPx = Math.round((p.curSeconds * 1000) / p.totalSeconds);
        document.getElementById('progress_loaded').style.width = progressPx + 'px';
        document.getElementById('progress_left').style.width = (1000 - progressPx) + 'px';
        var progressText = secondsToDuration(Math.round(p.curSeconds)) + ' / ' + secondsToDuration(p.totalSeconds);
        widgetAPI.putInnerHTML(document.getElementById('progress_text'), progressText);
    },

    updateBufferingInfo: function () {
        var playerScene = Main.getScene('player_scene');
        var statusElement = document.getElementById('header_status');
        widgetAPI.putInnerHTML(statusElement, playerScene.bufferingProgress + '%');
    },

    showOverlay: function () {
        document.getElementById('header_wrapper').classList.remove('hidden');
        document.getElementById('footer_wrapper').classList.remove('hidden');
    },

    hideOverlay: function () {
        document.getElementById('header_wrapper').classList.add('hidden');
        document.getElementById('footer_wrapper').classList.add('hidden');
    },

    onKeyPause: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.pause();
    },

    onKeyPlay: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.resume();
    },

    onKeyRw: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(10);
    },

    onKeyFf: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(10);
    },

    onKeyDown: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(30);
    },

    onKeyUp: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(30);
    },

    onKeyLeft: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(120);
    },

    onKeyRight: function () {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(120);
    }
};

document.addEventListener('DOMContentLoaded', function(e){
    document.body.addEventListener('player:video:play', Player.showAndPlay, false);
}, false);