Player = function (id) {
    this.id = id;
    this.url = '';
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
            log("buffering started");
            this.duration = new PlayTime(this.AVPlay.getDuration());
        },
        onbufferingprogress: function (percent) {
            this.bufferingProgress = percent;
            ////Player.updateBufferingInfo();
        },
        onbufferingcomplete: function () {
            log("buffering completely");
        }
    };

    this.playCB = {
        oncurrentplaytime: function (time) {
            this.curTime = time;
            this.updateTimeInfo();
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

    this.play = function(url) {
        this.url = url;
        try {
            this.show();
            this.init();
            this.AVPlay.open(url); // TODO
            this.AVPlay.play(this.successCB, this.errorCB); // TODO
        } catch (e) {
            log('Player.play failed');
            log(e.message);
        }
    };

    this.show = function() {
        document.getElementById('player_wrapper').classList.remove('hidden');
        this.hideOverlay();
        // TODO title in overlay?
        // TODO header / footer cleanup
        // TODO header / footer repurpose for player
        // TODO hide:: header / footer repurpose for grid
        //var e = document.getElementById('player_overlay_title_info');
        //widgetAPI.putInnerHTML(e, this.curItemTitle);
        //Player.showPlayerOverlay();
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

    this.showOverlay = function() {
        document.getElementById('header').classList.remove('hidden');
        document.getElementById('footer').classList.remove('hidden');
    };

    this.hideOverlay = function(){
        document.getElementById('header').classList.add('hidden');
        document.getElementById('footer').classList.add('hidden');
    };
};