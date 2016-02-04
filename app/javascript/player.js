Player = function (id) {
    this.footerHtml = '<div class="footer-group"><img class="footer-icon" src="./res/rew_ff.png"><span class="footer-text"> = &plusmn; 10c</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/up_down.png"><span class="footer-text"> = &plusmn; 30c</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/left_right.png"><span class="footer-text"> = &plusmn; 2м</span></div>';
    this.id = id;
    this.url = '';
    this.totalSeconds = -1;
    this.e = document.getElementById(id);
    this.bInited = false;
    this.dimensions = {
        width: 1280,
        height: 720
    };
    this.AVPlay = null;
    this.timeoutId = -1;
    this.bufferingCB = {
        onbufferingstart : function () {
            log("onbufferingstart");
            console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = 0;
            playerScene.updateBufferingInfo();
            playerScene.showOverlay();
        },
        onbufferingprogress: function (percent) {
            log("onbufferingprogress");
            console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = percent;
            playerScene.updateBufferingInfo();
            playerScene.showOverlay();
        },
        onbufferingcomplete: function () {
            log("onbufferingcomplete");
            console.dir(arguments);
            var playerScene = Main.getScene('player_scene');
            playerScene.bufferingProgress = 100;
            playerScene.updateBufferingInfo();
            playerScene.timeoutId = setTimeout(playerScene.hideOverlay, 3000);
        }
    };

    this.playCB = {
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
    };

    this.showAndPlay = function(url, duration) {
        log('Player.showAndPlay');
        var playerScene = Main.showScene('player_scene');
        Main.showSpinner('Картинка готовится');
        playerScene.play(url, duration);
    };

    this.onShow = function()
    {
        document.getElementById('footer_wrapper').classList.add('extended-footer');
        document.getElementById('footer_progress_bar').classList.remove('hidden');
        var player = Main.getScene('player_scene');
        var footer = document.getElementById('footer');
        widgetAPI.putInnerHTML(footer, player.footerHtml);
    };

    this.onHide = function()
    {
        document.getElementById('footer_wrapper').classList.remove('extended-footer');
        document.getElementById('footer_progress_bar').classList.add('hidden');
        var playerScene = Main.getScene('player_scene');
        playerScene.showOverlay();
        if (playerScene.timeoutId != -1) {
            clearTimeout(playerScene.timeoutId);
        }
        var statusElement = document.getElementById('header_status');
        widgetAPI.putInnerHTML(statusElement, '');
    };

    this.play = function(url, duration) {
        this.url = url;
        this.totalSeconds = duration;
        try {
            Main.hideSpinner();
            this.init();
            this.AVPlay.open(url);
            this.AVPlay.play(this.successCB, this.errorCB);
        } catch (e) {
            log('Player.play failed');
            log(e.message);
        }
    };

    this.init = function() {
        var result = true;
        if (this.bInited !== true) {
            try {
                webapis.avplay.getAVPlay(this.getAVPlaySuccess, this.getAVPlayError);
                var initOptions = {
                    containerID: 'player_container',
                    bufferingCallback: this.bufferingCB,
                    playCallback: this.playCB,
                    displayRect: {
                        top: 0,
                        left: 0,
                        width: this.dimensions.width,
                        height: this.dimensions.height
                    },
                    autoRatio: true,
                    zIndex: 1
                };
                this.AVPlay.init(initOptions);
            } catch (e) {
                log('ERROR Player.init');
                log(e);
                result = false;
            }
        }
        return result;
    };

    this.getAVPlaySuccess = function(avplay) {
        this.bInited = true;
        log('Getting avplay object successfully');
        Main.getScene('player_scene').AVPlay = avplay;
    };

    this.getAVPlayError = function(a,b,c,d,e) {
        log('ERROR: Player.getAVPlayerror. a,b,c,d,e');
        console.dir([a,b,c,d,e]);
    };

    this.successCB = function() {
        log('Player.successCB');
        var p = Main.getScene('player_scene');
        document.getElementById('player_container')
            .children[p.AVPlay.id]
            .addEventListener('mousemove', p.mouseMoved);
    };

    this.errorCB = function(a,b,c,d,e) {
        log('Player.errorCB');
        log([a,b,c,d,e]);
    };

    this.mouseMoved = function() {
        var playerScene = Main.getScene('player_scene');
        playerScene.showOverlay();
        if (playerScene.timeoutId != -1) {
            clearTimeout(playerScene.timeoutId);
        }
        playerScene.timeoutId = setTimeout(playerScene.hideOverlay, 3000);
    };

    this.updateTimeInfo = function() {
        var p = Main.getScene('player_scene');
        var progressPx = Math.round((p.curSeconds * 1000) / p.totalSeconds);
        document.getElementById('progress_loaded').style.width = progressPx + 'px';
        document.getElementById('progress_left').style.width = (1000 - progressPx) + 'px';
        var progressText = Utils.secondsToDuration(Math.round(p.curSeconds)) + ' / ' + Utils.secondsToDuration(p.totalSeconds);
        widgetAPI.putInnerHTML(document.getElementById('progress_text'), progressText);
    };

    this.updateBufferingInfo = function()
    {
        var playerScene = Main.getScene('player_scene');
        var statusElement = document.getElementById('header_status');
        widgetAPI.putInnerHTML(statusElement, playerScene.bufferingProgress + '%');
    };

    this.showOverlay = function() {
        document.getElementById('header_wrapper').classList.remove('hidden');
        document.getElementById('footer_wrapper').classList.remove('hidden');
    };

    this.hideOverlay = function(){
        document.getElementById('header_wrapper').classList.add('hidden');
        document.getElementById('footer_wrapper').classList.add('hidden');
    };

    this.onKeyPause = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.pause();
    };

    this.onKeyPlay = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.resume();
    };

    this.onKeyRw = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(10);
    };

    this.onKeyFf = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(10);
    };

    this.onKeyDown = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(30);
    };

    this.onKeyUp = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(30);
    };

    this.onKeyLeft = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpBackward(120);
    };

    this.onKeyRight = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.jumpForward(120);
    };
};