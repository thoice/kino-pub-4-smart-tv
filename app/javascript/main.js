widgetAPI = new Common.API.Widget();
tvKeyValue = new Common.API.TVKeyValue() || {};

Main = {
    scenes: {},
    onLoad: function () {
        widgetAPI.sendReadyEvent();
        log('Main.onLoad');
        Main.apier = Kinopub;
        document.body.dispatchEvent(new Event('auth:init:call'));
        //var event = new Event('kbdbl:needfocus');
        //document.body.dispatchEvent(event);
        document.body.addEventListener('keydown', Main.onKeyDown, false);
    },
    onKeyDown: function (e) {
        var keyCode = e.keyCode;
        // TODO get actual codes
        /*
         37 - left
         38 - up
         39 - right
         40 - down
         13 - enter
         */
        log(keyCode);
        var event;
        var l = document.activeElement || followClassCrumbs('kbdbl-focused');
        if (!l) {
            // todo Error. Focus not found
        }
        l.focus();
        if (keyCode === TvKeyCode.KEY_LEFT || keyCode === TvKeyCode.KEY_RIGHT
            || keyCode === TvKeyCode.KEY_UP || keyCode === TvKeyCode.KEY_DOWN
        ) {
            event = new Event('kbdbl:navigate');
            event.keyCode = keyCode;

        } else if (keyCode === TvKeyCode.KEY_ENTER && l.dataset['onKeyEnter'] !== undefined) {
            event = new Event(l.dataset['onKeyEnter']);
            event.l = l;
        }

        if (event) {
            document.body.dispatchEvent(event);
        }
    },
    ajax: function (method, url, parameters, callName) {
        if (typeof method === 'object') {
            callName = method.call_name || '';
            var customParameters = JSON.parse(JSON.stringify(method.parameters)) || {};
            url = Main.apier.getUrlFor(callName);

            var paramPlaceholders = url.match(/{(.+?)}/g); // find template vars
            var paramPlaceholder, paramForPlaceholder;

            for (var p in paramPlaceholders) {
                if (!paramPlaceholders.hasOwnProperty(p)) {
                    continue;
                }
                paramPlaceholder = paramPlaceholders[p];
                paramForPlaceholder = paramPlaceholder.replace(/^{|}$/g, ''); // strip heading and trailing braces
                if (customParameters && customParameters[paramForPlaceholder]) {
                    url = url.replace(paramPlaceholder, customParameters[paramForPlaceholder]);
                    delete(customParameters[paramForPlaceholder]);
                }
            }
            parameters = Main.apier.getParametersFor(callName, customParameters);
            method = Main.apier.getMethodFor(callName)
        }

        var xhr = new XMLHttpRequest();

        var data, urlParameters, token;
        var d = new Date();
        var curtime = '&curtime=' + d.getTime();
        if (method.toLowerCase() === 'post') {
            token = '';
            urlParameters = '';
            curtime = '';
            data = parameters;
        } else {

            var s = Settings.getData('session');
            if (!s || !s['access_token_response'] || !s['access_token_response']['access_token']) {
                // todo reauth if token not found
            }
            token = 'access_token=' + s['access_token_response']['access_token'];
            token = '?' + token + '&';
            data = null;
            urlParameters = parameters;
        }
        xhr.open(method, url + token + urlParameters + curtime);
        xhr._requestTimestamp = Math.round(d.getTime() / 1000);
        xhr.onreadystatechange = Main.ajaxStateChange;
        xhr.callName = callName;
        xhr.send(data);
        return xhr;
    },
    ajaxStateChange: function (e) {
        if (this.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        log('callName:[' + this.callName + ']  readyState:[' + this.readyState + ']  status:[' + this.status + ']');
        var parsedResponse = JSON.parse(this.responseText);
        var resultEventName;
        if (this.status !== 200) {
            resultEventName = 'ajax:' + this.callName + ':error';
        } else {
            resultEventName = 'ajax:' + this.callName + ':success';
        }
        var resultEvent = new Event(resultEventName);
        parsedResponse._requestTimestamp = this._requestTimestamp;
        resultEvent.parsedResponse = parsedResponse;
        document.body.dispatchEvent(resultEvent);
    },
    addScene: function (id, scene) {
        Main.scenes[id] = scene;
    },
    showScene: function (ids) {
        if (ids.indexOf === undefined) {
            ids = [ids];
        }

        var scenes = document.querySelectorAll('.scene');
        var scene;
        for (var s in scenes) {
            if (!scenes.hasOwnProperty(s)) {
                continue;
            }
            scene = scenes[s];
            if (ids.indexOf(scene.id) < 0) {
                scene.classList.add('hidden');
            } else {
                scene.classList.remove('hidden');
            }
        }
    }
};