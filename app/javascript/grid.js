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
    init: function () {
        document.body.removeEventListener('auth:access_token:success');
        Grid.availParameters.perpage = Grid.availParameters.itemsPerRow * Grid.availParameters.rowsPerGrid;
        Grid.initParameters();

        document.body.addEventListener('auth:access_token:success', Grid.loadPage, false);
        document.body.addEventListener('ajax:grid_get_items:success', Grid.loadPageSuccess, false);
        document.body.addEventListener('kbdbl:onfocus', Grid.updateHeader, false);
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
        var gridContainerL = document.querySelector('#grid_container');
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
        var focusedL = followClassCrumbs('kbdbl-focused');
        focusedL.focus();
    },
    convertItemToGridItem: function(itemData, rowInGrid, itemInRow, shouldHaveFocus)
    {
        var gridItemWrapper = document.createElement('div');
        gridItemWrapper.tabIndex = -1;
        gridItemWrapper.classList.add('kbdbl');
        gridItemWrapper.classList.add('kbdbl-x-' + itemInRow);
        gridItemWrapper.classList.add('grid-item-wrapper');
        if (shouldHaveFocus) {
            gridItemWrapper.classList.add('kbdbl-focused');
        }
        gridItemWrapper.dataset.kbdblX = itemInRow;

        var gridItem = document.createElement('div');

        gridItem.classList.add('grid-item');
        gridItem.dataset.id = itemData.id;
        gridItem.dataset.title = itemData.title;
        gridItem.dataset.year = itemData.year;
        gridItem.dataset.onKeyEnter = 'info:load';
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

        var miniInfoText =  itemData.type + '<br/>'
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
    updateHeader: function(e) {
        var headerL = document.querySelector('#header');
        var updateWith = '';
        var wrapper = e.l;
        if (e.l) {
            var item = findChildWithClass(e.l, 'grid-item');
            if (item && item.dataset && item.dataset.title)
            updateWith = item.dataset.title;
        }
        widgetAPI.putInnerHTML(headerL, updateWith);
    }
};
document.addEventListener('DOMContentLoaded', Grid.init, false);