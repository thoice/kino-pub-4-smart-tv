Grid = function(id) {
    log('Init Grid');
    this.footerHtml = 'left/right/up/down = navigate. Return = open info. Tools/Guide = open search/menu.';
    this.parameters = {
        // TODO If filter applied, remember to reset page to 1
        page: 1,
        perpage: 10,
        title: ''
    };
    this.id = id;
    this.e = document.getElementById(id);
    if (this.e === undefined) {
        throw Error('DOM element with id ' + id + ' does not exist.');
    }

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
        var eId = Main.getScene('grid_scene').id;
        eId += '_content';
        var gridElement = document.getElementById(eId);
        widgetAPI.putInnerHTML(gridElement, '');
        for (var i = 0; i < items.length; i++) {
            var gridItem = items[i];
            //gridItem.addEventListener('click', Main.getScene('grid_scene').loadAndShowItemInfo);
            gridItem.addEventListener('mouseenter', Main.getScene('grid_scene').updateHeader);
            gridItem.addEventListener('mouseleave', Main.getScene('grid_scene').clearHeader);
            gridElement.appendChild(gridItem);
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
        var s = Main.getScene('grid_scene');
        if (element.dataset && element.dataset.pagetogo) {
            s.parameters.page = element.dataset.pagetogo;
            s.showAndLoadPage();
        }
    };
};
