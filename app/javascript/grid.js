Grid = function(id) {
    log('Init Grid');
    this.footerHtml = '<div class="footer-group"><img class="footer-icon" src="./res/move.png"><span class="footer-text"> = Навигация</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/enter.png"><span class="footer-text"> = Открыть информацию</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/tools.png">/<img class="footer-icon" src="./res/guide.png"><span class="footer-text"> = Поиск/Меню</span></div>';
    this.availParameters = {page: 1, perpage: 10, title: null, type: null, genre: null};
    this.parameters = {
        page: 1,
        perpage: 10,
        title: null,
        type: null,
        genre: null
    };
    this.id = id;
    this.e = document.getElementById(id);
    if (this.e === undefined) {
        throw Error('DOM element with id ' + id + ' does not exist.');
    }

    /**
     * Update parameters
     *
     * @param parametersObj
     */
    this.setParameters = function(parametersObj)
    {
        var grid = Main.getScene('grid_scene');
        grid.parameters = grid.availParameters;
        for (var param in parametersObj) {
            if (!parametersObj.hasOwnProperty(param) || grid.availParameters.indexOf(param) === -1) { continue; }
            grid.parameters[param] = parametersObj[param];
        }
    };

    this.setParameter = function(parameter, value)
    {
        var grid = Main.getScene('grid_scene');
        if (!grid.availParameters.hasOwnProperty(parameter)) { return; }
        grid.parameters[parameter] = value;
    };

    this.showAndLoadPage = function () {
        log('Grid.showAndLoadPage');
        Main.showSpinner('Роботы работают, и вот-вот покажут нам результаты');
        Main.showScene('grid_scene');
        var grid = Main.getScene('grid_scene');
        Main.apier.ajax(Main.apier.getItemsUrl(), grid.parameters, 'get', grid.loadHandler);
    };

    this.loadHandler = function (response) {
        var pagersUpdateInfo = Main.apier.getPagersInfoFromResponse(response);
        var pagers = document.querySelectorAll('.pager-wrapper');
        for (var p = 0; p < pagers.length; p++) {
            var pager = pagers[p];
            if (pager.id === 'pager_left' && pagersUpdateInfo.left !== undefined) {
                pager.classList.add('enabled');
                pager.dataset.pagetogo = pagersUpdateInfo.left;
            } else if (pager.id === 'pager_right' && pagersUpdateInfo.right !== undefined){
                pager.classList.add('enabled');
                pager.dataset.pagetogo = pagersUpdateInfo.right;
            } else {
                pager.classList.remove('enabled');
                pager.dataset.pagetogo = '';
            }
        }
        var items = Main.apier.getItemsFromResponse(response);
        var grid = Main.getScene('grid_scene');
        var eId = grid.id;
        eId += '_content';
        var gridElement = document.getElementById(eId);
        widgetAPI.putInnerHTML(gridElement, '');
        for (var i = 0; i < items.length; i++) {
            var gridItem = items[i];
            gridItem.addEventListener('mouseenter', Main.getScene('grid_scene').updateHeader);
            gridItem.addEventListener('mouseleave', Main.getScene('grid_scene').clearHeader);
            gridElement.appendChild(gridItem);
        }

        var missingItems = grid.parameters.perpage - items.length;

        for (i = 0; i < missingItems; i++) {
            var gridItemPlaceholder = document.createElement('div');
            gridItemPlaceholder.classList.add('grid-item-placeholder');
            gridElement.appendChild(gridItemPlaceholder);
        }

        Main.hideSpinner();
        log('Grid.loadHandler complete');
    };

    this.onShow = function (e) {
        var footer = document.getElementById('footer');
        var grid = Main.getScene('grid_scene');
        widgetAPI.putInnerHTML(footer, grid.footerHtml);
    };

    this.updateHeader = function (e) {
        var headerElement = document.getElementById('header');
        var header = '';
        header += '[' + this.dataset.year + ']' || '';
        header += ' ' + this.dataset.title;
        widgetAPI.putInnerHTML(headerElement, header);
    };

    this.clearHeader = function(e) {
        var headerElement = document.getElementById('header');
        widgetAPI.putInnerHTML(headerElement, '');
    };

    this.loadAndShowItemInfo = function(element) {
        Main.pushToFocusStack(this, element);
        Main.getScene('info_scene').showAndLoad(element);
    };

    this.gotoPage = function(element)
    {
        var pageToGo;
        if (element === parseInt(element, 10)) {
            pageToGo = element;
        } else if (element && element.dataset && element.dataset.pagetogo) {
            pageToGo = element.dataset.pagetogo;
        }
        var grid = Main.getScene('grid_scene');
        if (pageToGo) {
            grid.setParameter('page', pageToGo);
            grid.showAndLoadPage();
        }
    };

    this.onKeyRight = function (element)
    {
        if (document.activeElement === document.body) { // mouse used
            var grid = Main.getScene('grid_scene');
            grid.gotoPage(grid.parameters.page + 1);
        } else { // keyboard used

        }
    };

    this.onKeyLeft = function (element)
    {
        if (document.activeElement === document.body) { // mouse used
            var grid = Main.getScene('grid_scene');
            var pageTogo = (grid.parameters.page - 1) > 0 ? grid.parameters.page - 1 : null;
            grid.gotoPage(pageTogo);
        } else { // keyboard used

        }
    };

    /**
     * Reset all filters
     *
     * @param element
     * @param event
     */
    this.onKeyReturn = function(element, event)
    {
        var grid = Main.getScene('grid_scene');
        grid.setParameters();
        grid.showAndLoadPage();
    };
};
