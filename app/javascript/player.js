// TODO p.AVPlay.jumpForward(sec)
// TODO p.AVPlay.jumpBackward

Player = function (id) {
    this.footerHtml = '<div id="footer_progress_bar">' +
        '<div id="progress_loaded" class="progress-part"></div>' +
        '<div id="progress_left" class="progress-part"></div>' +
        '<div id="progress_text" class="progress-part">00:00:00</div>' +
    '</div>';
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
            //this.duration = new PlayTime(this.AVPlay.getDuration());
        },
        onbufferingprogress: function (percent) {
            log("onbufferingprogress");
            //this.bufferingProgress = percent;
            ////Player.updateBufferingInfo();
        },
        onbufferingcomplete: function () {
            log("onbufferingcomplete");
        }
    };

    this.playCB = {
        oncurrentplaytime: function (time) {
            log("oncurrentplaytime " + time);
            var p = Main.getScene('player_scene');
            p.curSeconds = time.millisecond / 1000;
            p.updateTimeInfo();
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

    //this.curItemTitle = '';
    this.showAndPlay = function(url, duration) {
        log('Player.showAndPlay');
        var playerScene = Main.showScene('player_scene');
        Main.showSpinner('Картинка готовится');
        playerScene.play(url, duration);
    };

    this.onShow = function()
    {
        var footer = document.getElementById('footer');
        var player = Main.getScene('player_scene');
        widgetAPI.putInnerHTML(footer, player.footerHtml);
    };

    this.onHide = function()
    {
        var footer = document.getElementById('footer');
        footer.classList.remove('hidden');
        var header = document.getElementById('header');
        header.classList.remove('hidden');
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
        var p = Main.getScene('player_scene');
        p.showOverlay();
        if (p.timeoutId != -1) {
            clearTimeout(p.timeoutId);
        }
        p.timeoutId = setTimeout(p.hideOverlay, 3000);
    };

    this.updateTimeInfo = function() {
        var p = Main.getScene('player_scene');
        var progressPx = Math.round((p.curSeconds * 1000) / p.totalSeconds);
        document.getElementById('progress_loaded').style.width = progressPx + 'px';
        document.getElementById('progress_left').style.width = (1000 - progressPx) + 'px';
        var progressText = Utils.secondsToDuration(Math.round(p.curSeconds)) + ' / ' + Utils.secondsToDuration(p.totalSeconds);
        widgetAPI.putInnerHTML(document.getElementById('progress_text'), progressText);
    };

    this.showOverlay = function() {
        document.getElementById('header').classList.remove('hidden');
        document.getElementById('footer').classList.remove('hidden');
    };

    this.hideOverlay = function(){
        document.getElementById('header').classList.add('hidden');
        document.getElementById('footer').classList.add('hidden');
    };

    this.onKeyPause = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.pause();
    };

    this.onKeyPlay = function() {
        var p = Main.getScene('player_scene');
        p.AVPlay.resume();
    };
};