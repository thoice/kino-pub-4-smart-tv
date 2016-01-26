var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();

var Main =
{
    apier: null,
    widget: new Common.API.Widget(),
    scenes: {},
    activeScene: null,
    focusStack: []
};

/**
 * Executed when body is loaded
 */
Main.onLoad = function()
{
    if (debug === true) {
        document.getElementById('debug_wrapper').classList.remove('hidden');
    }
    widgetAPI.sendReadyEvent();
    this.enableKeys();
    log('ReadySent');
    var gridScene = new Grid('grid_scene');
    Main.scenes['grid_scene'] = gridScene;
    Main.scenes['info_scene'] = new Info('info_scene');
    Main.scenes['player_scene'] = new Player('player_scene');
    Main.scenes['apier'] = Kinopub;
    Main.activeScene = 'apier';
    Main.apier = Main.getScene('apier');
    // TODO handle ignored login (just browse favourites?)
    // TODO init Menu with getTypes, getGenres, getCountries
    Main.apier.login(gridScene.showAndLoadPage, log);
};

Main.onUnload = function()
{};

Main.enableKeys = function()
{
    log('logging keydown');
    document.body.addEventListener('click', Main.keyDown.bind(Main), false);
    document.body.addEventListener('keydown', Main.keyDown.bind(Main), false);
    // TODO used for older TVs. Implement?
    //document.getElementById("anchor").focus();
};

/**
 * Show spinner with custom message or default
 * @param message
 */
Main.showSpinner = function(message, buttonHandler) {
    var sw = document.getElementById('spinner_wrapper');
    var s = document.getElementById('spinner');
    if (sw === null || s === null) { return; }
    message = message || 'Вас много, а роботы - одни. Ждите...';
    widgetAPI.putInnerHTML(s, message);
    s.style.marginTop = (curWidget.height - s.clientHeight) / 2 + 'px';
    sw.classList.remove('hidden');
};

Main.hideSpinner = function() {
    var w = document.getElementById('spinner_wrapper');
    if (w === null) { return; }
    w.classList.add('hidden');
};

Main.getScene = function(sceneId)
{
    var scene = Main.scenes[sceneId];
    if (typeof scene === 'object') {
        return scene;
    }
};

Main.getAllScenes = function()
{
    return Main.scenes;
};

Main.showScene = function(sceneId)
{
    var newScene = Main.getScene(sceneId);
    if (!newScene || typeof newScene !== 'object') {
        log('No scene with id ' + sceneId);
    }

    var scenes = Main.getAllScenes();

    for (s in scenes) {
        if (!scenes.hasOwnProperty(s)) {continue;}
        var scene = scenes[s];
        if (!scene.e || !scene.e.classList) {continue;}
        if (scene.id !== sceneId) {
            scene.e.classList.add('hidden');
        } else {
            scene.e.classList.remove('hidden');
        }
    }

    Main.activeScene = newScene.id;
    return newScene;
};

Main.pushToFocusStack = function(scene, element)
{
    if (!scene) { return; }
    Main.focusStack.push(
        {
            scene: scene,
            element: element
        }
    );
};

Main.getActiveScene = function()
{
    return Main.scenes[Main.activeScene];
};


Main.keyDown = function()
{
    // TODO handle return button to pop focusStack
    var keyCode = event.keyCode;
    log('keydown ' + keyCode);
    if (event.type == 'click')
    {
        keyCode = tvKey.KEY_ENTER;
    }

    // Find key name by code and build up a handler name to look up in the element
    var keyName = Utils.findKeyByValue(tvKey, keyCode) || '';
    keyName = keyName.toLowerCase();
    if (!keyName) {
        log('this key(' + keyName + ':' + keyCode + ') is not handled by this element');
    }

    var handlerCode = 'on__' + keyName;
    var element = Utils.findAscenderWithData(event.target, handlerCode);

    var handlerName = 'on';
    var kParts = keyName.split('_');
    for (var k = 0; k < kParts.length; k++ ) {
        handlerName += kParts[k][0].toUpperCase() + kParts[k].slice(1);
    }

    var scene = Main.getActiveScene();

    if (element) {
        handlerName = element.dataset[handlerCode];
    }

    if (scene[handlerName] !== undefined) {
        event.preventDefault();
        event.stopPropagation();
        scene[handlerName](element, event);
        return;
    }

    log("Key pressed: " + keyCode);

    switch(keyCode)
    {
        case tvKey.KEY_RETURN:
        case tvKey.KEY_PANEL_RETURN:
            log("RETURN");
            widgetAPI.sendReturnEvent();
            break;
        default:
            log("Unhandled key");
            break;
    }
};