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
    Main.scenes['apier'] = Kinopub; //TODO should this be present? We can handle mouse clicks in login screen with default keydown handler
    Main.activeScene = Kinopub;
    Main.apier = Kinopub;
    // TODO handle ignored login (just browse favourites?)
    // TODO init Menu with getTypes, getGenres, getCountries
    Main.apier.login(gridScene.loadAndRenderPage, log);
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
    // TODO handler with data attributes
    var button = document.querySelector('#spinner .button');
    if (button) {
        button.addEventListener('click', buttonHandler);
    }
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
};

Main.pushToFocusStack = function(scene, element)
{
    if (!scene) { return; }
    // TODO implement element
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
    log('keypressed');
    // TODO check if this is fired after addEventListener('click', something) was finished.
    // TODO maybe stopPropagation and preventDefault?
    // TODO 1) get keyCode || enter as keyCode if it is a click
    // TODO 2) attach to data-handler- 37
    // TODO 3) search for handler in parents of data-handler-37
    // TODO 4) if found, then call handler with this item
    var element = findAscenderWithData(event.target, 'handler');
    if (!element) {
        log('No element with handler found for event.type ' + event.type + ' and code ' + event.keyCode);
        return;
    }
    var handler = element.dataset['handler'];
    var scene = Main.getActiveScene();
    if (scene[handler] !== undefined) {
        scene[handler](element);
    }
    // TODO element == null means that no parent has handler. Handle by default handler
    var keyCode = event.keyCode;
    if (event.type == 'click')
    {
        keyCode = tvKey.KEY_ENTER;
    }

    log("Key pressed: " + keyCode);

    switch(keyCode)
    {
        case tvKey.KEY_RETURN:
        case tvKey.KEY_PANEL_RETURN:
            log("RETURN");
            widgetAPI.sendReturnEvent();
            break;
        case tvKey.KEY_LEFT:
            log("LEFT");
            break;
        case tvKey.KEY_RIGHT:
            log("RIGHT");
            break;
        case tvKey.KEY_UP:
            log("UP");
            break;
        case tvKey.KEY_DOWN:
            log("DOWN");
            break;
        case tvKey.KEY_ENTER:
        case tvKey.KEY_PANEL_ENTER:
            log("ENTER");
            break;
        default:
            log("Unhandled key");
            break;
    }
};

/*
* get parent element that has corresponding data attribute
* */
findAscenderWithData = function(e, dataName)
{
    if (e.dataset && e.dataset[dataName] !== undefined) {
        return e;
    }
    if (e.parentNode !== null) {
        return findAscenderWithData(e.parentNode, dataName);
    }
    return null;
};
