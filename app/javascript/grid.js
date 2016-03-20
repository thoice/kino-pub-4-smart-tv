Grid = {
    availParameters: {
        itemsPerRow: 5,
        rowsPerGrid: 2,
        page: 1,
        title: null,
        type: null,
        genre: null
    },
    parameters: {},
    id: 'grid_wrapper',
    dependentId: 'menu_wrapper',
    l: null,
    init: function () {
        // document.body.removeEventListener('auth:access_token:success');
        Grid.availParameters.perpage = Grid.availParameters.itemsPerRow * Grid.availParameters.rowsPerGrid;
        Grid.initParameters();

        Grid.l = document.querySelector('#' + Grid.id);
        Main.addScene(Grid.id, Grid);

        document.body.addEventListener('auth:access_token:success', Grid.loadPage, false);
        document.body.addEventListener('ajax:grid_get_items', Grid.loadPage, false);
        document.body.addEventListener('ajax:grid_get_items:success', Grid.loadPageSuccess, false);
        document.body.addEventListener('grid:pager:focus', Grid.pagerFocus, false);
    },
    initParameters: function () {
        Grid.parameters = JSON.parse(JSON.stringify(Grid.availParameters));
        delete(Grid.parameters.itemsPerRow);
        delete(Grid.parameters.rowsPerGrid);
    },
    loadPage: function (e) {
        log('Grid.loadPage');
        Main.ajax({
            call_name: 'grid_get_items',
            parameters: Grid.parameters
        });
    },
    loadPageSuccess: function (e) {
        log('Grid.loadPageSuccess');
        var pagersUpdateInfo = Grid.getPagersInfoFromResponse(e.parsedResponse);
        var pagers = document.querySelectorAll('.pager-wrapper');
        for (var p = 0; p < pagers.length; p++) {
            var pager = pagers[p];
            if (pager.id === 'grid_pager_left' && pagersUpdateInfo.left !== undefined) {
                pager.classList.add('enabled');
                pager.dataset.pagetogo = pagersUpdateInfo.left;
            } else if (pager.id === 'grid_pager_right' && pagersUpdateInfo.right !== undefined) {
                pager.classList.add('enabled');
                pager.dataset.pagetogo = pagersUpdateInfo.right;
            } else {
                pager.classList.remove('enabled');
                pager.dataset.pagetogo = '';
            }
        }

        var gridContainerL = document.querySelector('#grid_container');
        widgetAPI.putInnerHTML(gridContainerL, '');
        var itemIndex, itemData, item;
        for (var rowInGrid = 0; rowInGrid < Grid.availParameters.rowsPerGrid; rowInGrid++) {
            var rowL = document.createElement('div');
            rowL.classList.add('kbdbl-row');
            rowL.classList.add('kbdbl-focused');
            rowL.classList.add('kbdbl-y-' + rowInGrid);
            rowL.dataset.kbdblY = rowInGrid;

            for (var itemInRow = 0; itemInRow < Grid.availParameters.itemsPerRow; itemInRow++) {
                itemIndex = (rowInGrid * Grid.availParameters.itemsPerRow) + itemInRow;
                itemData = e.parsedResponse.items[itemIndex];
                if (itemData) {
                    var shouldHaveFocus = false;
                    if (rowInGrid === 0 && itemInRow === 0) {
                        shouldHaveFocus = true;
                    }
                    item = Grid.convertItemToGridItem(itemData, rowInGrid, itemInRow, shouldHaveFocus);
                } else {
                    // todo add placeholder
                    // todo skip placeholder from navigation
                    // todo redo keyboard to skip placeholders also
                }
                rowL.appendChild(item);
            }
            gridContainerL.appendChild(rowL);
        }
        Main.showScene('grid_wrapper', true);
    },
    getPagersInfoFromResponse: function (response) {
        var pagers = {};
        var pagination = response['pagination'];
        if (pagination === undefined) { return pagers; }
        if (pagination['current'] !== 1) {
            pagers.left = pagination['current'] - 1;
        }

        if (pagination['current'] !== pagination['total'] && response.items && response.items.length <= pagination['perpage']) {
            pagers.right = pagination['current'] + 1;
        }
        return pagers;
    },
    convertItemToGridItem: function (itemData, rowInGrid, itemInRow, shouldHaveFocus) {
        var gridItemWrapper = document.createElement('div');
        gridItemWrapper.tabIndex = -1;
        gridItemWrapper.classList.add('kbdbl');
        gridItemWrapper.classList.add('kbdbl-x-' + itemInRow);
        gridItemWrapper.classList.add('grid-item-wrapper');
        if (shouldHaveFocus) {
            gridItemWrapper.classList.add('kbdbl-focused');
        }
        gridItemWrapper.dataset.kbdblX = itemInRow;
        gridItemWrapper.dataset.onKeyEnter = 'info:load';

        var gridItem = document.createElement('div');

        gridItem.classList.add('grid-item');
        gridItem.dataset.id = itemData.id;
        gridItem.dataset.title = itemData.title;
        gridItem.dataset.year = itemData.year;
        gridItem.style.backgroundColor = '#64194b';
        var miniInfo = document.createElement('div');
        miniInfo.classList.add('grid-mini-info');

        var imdbRatingWrapper = document.createElement('div');
        imdbRatingWrapper.classList.add('mini-info-rating-wrapper');
        var imdbLogo = document.createElement('img');
        imdbLogo.src = './res/imdb_logo.png';
        imdbLogo.classList.add('mini-info-rating-logo');
        imdbRatingWrapper.appendChild(imdbLogo);
        var imdbRatingText = document.createElement('span');
        var imdbRating = itemData.imdb_rating || 0.0;
        var imdbVotes = itemData.imdb_votes || 0;
        imdbRatingText.textContent = imdbRating.toFixed(1) + ' из ' + imdbVotes;
        imdbRatingWrapper.appendChild(imdbRatingText);

        var kinopoiskRatingWrapper = document.createElement('div');
        kinopoiskRatingWrapper.classList.add('mini-info-rating-wrapper');
        var kinopoiskLogo = document.createElement('img');
        kinopoiskLogo.src = './res/kinopoisk_logo.png';
        kinopoiskLogo.classList.add('mini-info-rating-logo');
        kinopoiskRatingWrapper.appendChild(kinopoiskLogo);
        var kinopoiskRatingText = document.createElement('span');
        var kinoPoiskRating = itemData.kinopoisk_rating || 0.0;
        var kinoPoiskVotes = itemData.kinopoisk_votes || 0;
        kinopoiskRatingText.textContent = kinoPoiskRating.toFixed(1) + ' из ' + kinoPoiskVotes;
        kinopoiskRatingWrapper.appendChild(kinopoiskRatingText);

        var kinoPubRating = itemData.rating || 0.0;
        var kinoPubViews = itemData.views || 0;

        var miniInfoText = itemData.type + '<br/>'
                + 'рейтинг: ' + kinoPubRating + '<br/>'
                + 'смотрели: ' + kinoPubViews + '<br/>'
            ;
        widgetAPI.putInnerHTML(miniInfo, miniInfoText);

        miniInfo.appendChild(imdbRatingWrapper);
        miniInfo.appendChild(kinopoiskRatingWrapper);
        gridItem.appendChild(miniInfo);

        var img = (itemData.posters !== undefined && itemData.posters.medium !== undefined) ? itemData.posters.medium : '';
        img = img.replace(/^https:/, 'http:');
        gridItem.style.backgroundImage = 'url("' + img + '")';

        gridItemWrapper.appendChild(gridItem);
        return gridItemWrapper;
    },
    /*gridItemFocus: function (e) {
        var headerL = document.querySelector('#header');
        var updateWith = '';
        var wrapper = e.l;
        if (e.l) {
            var item = findChildWithClass(e.l, 'grid-item');
            if (item && item.dataset && item.dataset.title)
                updateWith = item.dataset.title;
        }
        widgetAPI.putInnerHTML(headerL, updateWith);
    },*/
    pagerFocus: function (e) {
        log('grid:pager:focus in Grid.pagerFocus');
        if (e && e.l && e.l.dataset && e.l.dataset.pagetogo) {
            Grid.parameters.page = e.l.dataset.pagetogo;
            var event = new Event('ajax:grid_get_items');
            document.body.dispatchEvent(event);
        }
    }
};
document.addEventListener('DOMContentLoaded', Grid.init, false);