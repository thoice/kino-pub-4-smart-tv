// todo go to next episode

widgetAPI = new Common.API.Widget();
tvKeyValue = new Common.API.TVKeyValue() || {};

Main = {
    scenes: {},
    activeId: null,
    focusStack: [],
    onLoad: function () {
        widgetAPI.sendReadyEvent();
        log('Main.onLoad');
        Main.apier = Kinopub;
        document.body.dispatchEvent(new Event('auth:init:call'));
        document.body.addEventListener('keydown', Main.onKeyDown, false);
        document.body.addEventListener('main:focus', Main.fishForFocus, false);
    },
    onKeyDown: function (e) {
        var keyCode = e.keyCode;
        log('Key pressed:' + keyCode);
        
        var event;
        var l = Main.fishForFocus({l: e.srcElement});
        
        if (keyCode === TvKeyCode.KEY_LEFT || keyCode === TvKeyCode.KEY_RIGHT
            || keyCode === TvKeyCode.KEY_UP || keyCode === TvKeyCode.KEY_DOWN
        ) {
            event = new Event('kbdbl:navigate');
            event.keyCode = keyCode;
        } else if (keyCode === TvKeyCode.KEY_ENTER && l.dataset['onKeyEnter'] !== undefined) {
            event = new Event(l.dataset['onKeyEnter']);
            event.l = l;
        } else if (keyCode === TvKeyCode.KEY_RETURN) {
            Main.showScene(null, null, true);
            e.preventDefault();
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
    showScene: function (sceneId, fishForFocusAfter, popFromStack) {
        var focusableL = null;
        if (popFromStack) {
            var sceneData = Main.focusStack.pop();
            if (sceneData) {
                sceneId = sceneData['id'] || sceneId;
                focusableL = sceneData['activeL'] || null;
            }
        }
        var sceneIds = [sceneId];
        if (Main.scenes[sceneId] !== undefined && Main.scenes[sceneId]['dependentId'] !== undefined) {
            sceneIds.push(Main.scenes[sceneId]['dependentId']);
        }

        if (!popFromStack && Main.activeId) {
            var currentSceneData = {
                id: Main.activeId,
                activeL: document.activeElement
            };
            Main.focusStack.push(currentSceneData);
        }

        var sceneLs = document.querySelectorAll('.scene');
        var sceneL, scene;
        for (var s = 0; s < sceneLs.length; s++) {
            sceneL = sceneLs[s];
            scene = Main.scenes[sceneL.id] || {};
            if (sceneIds.indexOf(sceneL.id) < 0) {
                sceneL.classList.add('hidden');
                if (scene.onHide !== undefined) {
                    scene.onHide();
                }
            } else {
                sceneL.classList.remove('hidden');
                if (scene.onShow !== undefined) {
                    scene.onShow();
                }
            }
        }

        if (fishForFocusAfter || popFromStack) {
            var o = {};
            if (popFromStack) {
                o = {l:focusableL};
            }
            Main.fishForFocus(o);
        }
        Main.activeId = sceneId;
    },
    showModal: function (text, buttonLabel, buttonEventName) {
        // todo store header into focusStack?
        var modalWrapperId = 'modal_wrapper';
        var modalWrapperL = document.getElementById(modalWrapperId);
        widgetAPI.putInnerHTML(modalWrapperL, '');
        var modalContentWrapperL = document.createElement('div');
        modalContentWrapperL.id = 'modal_content_wrapper';
        modalContentWrapperL.classList.add('kbdbl-focused');
        var modalContent = document.createElement('div');
        modalContent.id = 'modal_content';
        modalContent.classList.add('kbdbl-focused');
        widgetAPI.putInnerHTML(modalContent, text);

        if (buttonLabel !== undefined) {
            var modalB = document.createElement('button');
            var modalBSpan = document.createElement('span');
            modalBSpan.textContent = buttonLabel;
            modalB.classList.add('button');
            modalB.classList.add('kbdbl-focused');
            modalB.dataset.onKeyEnter = buttonEventName;
            modalB.appendChild(modalBSpan);
            modalContent.appendChild(modalB);
        }
        modalContentWrapperL.appendChild(modalContent);
        modalWrapperL.appendChild(modalContentWrapperL);
        Main.showScene(modalWrapperId, true);
    },
    fishForFocus: function (e) {
        var l;
        if (e && e.l) {
            if (e.fishForFocusInL === true) {
                l = followClassCrumbs('kbdbl-focused', e.l);
            } else {
                l = e.l;
            }
        } else {
            l = followClassCrumbs('kbdbl-focused');
        }

        if (l.dataset['onFocusEvent']) {
            event = new Event(l.dataset['onFocusEvent']);
            event.l = l;
            document.body.dispatchEvent(event);
        } else {
            var title = '';
            if (l.firstElementChild && l.firstElementChild.dataset && l.firstElementChild.dataset['title']) {
                title = l.firstElementChild.dataset['title'];
            }
            widgetAPI.putInnerHTML(document.getElementById('header'), title);
            l.focus();
        }
        return l;
    }
};