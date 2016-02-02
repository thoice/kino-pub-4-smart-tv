var Kinopub = {
    api_endpoint_oauth: 'http://api.kino.pub/oauth2/device',
    api_endpoint: 'http://api.kino.pub/v1/',
    client_id: 'duna',
    client_secret: 'ha19qtm5utnjmj8csv8st3zxefrwpuyk',
    login: function(successHandler, errorHandler) {
        log('Settings.login');
        var session = Settings.getData('session');
        if (session === null) {
            errorHandler('login error ' + session);
        }
        if(session.deviceTokenResponse === undefined || Kinopub.isExpired(session.deviceTokenResponse)) {
            if (session.deviceCodeResponse === undefined || Kinopub.isExpired(session.deviceCodeResponse)) {
                // Get device_code
                Kinopub.getDeviceCode();
                var message = 'Подождите...связываемся с сервером<br/>'
                    + '//TODO добавить кнопочку "Ах, оставьте"';
                Main.showSpinner(message, Kinopub.ignoreActivation);
            } else {
                // Get response from session and pass it to handler
                Kinopub.deviceCodeHandler(session.deviceCodeResponse);
            }
        } else {
            successHandler();
        }
    },
    isExpired: function(data){
        if (data._requestTimestamp === undefined) {
            return true;
        }

        var now = Math.round(new Date().getTime() / 1000);
        return data._requestTimestamp + data.expires_in < now;

    },
    getDeviceCode: function(){
        var params = {
            grant_type: 'device_code',
            client_id: Kinopub.client_id,
            client_secret: Kinopub.client_secret
        };
        Kinopub.ajax(Kinopub.api_endpoint_oauth, params, 'post', Kinopub.deviceCodeHandler, Kinopub.errorHandler);
    },
    deviceCodeHandler: function(response){
        if (response.code === undefined || response.user_code === undefined) {
            Kinopub.errorHandler('deviceCodeHandler error ' + response);
        } else {
            // Wait for user to add code to the page
            response.expires_in         = response.expires_in || 30; // 30 seconds by default
            response.verification_uri   = response.verification_uri || 'http://kino.pub/device';
            response.interval           = response.interval || 5;

            var session = Settings.getData('session');
            session.deviceCodeResponse = response;
            Settings.setData('session', session);

            var message = 'Пользование сайтом вне браузера доступно только Pro аккаунтам. '
                + 'Как раз твой случай? Тогда вот что:<br/>'
                + '1) зайди по адресу '
                + '<span id="code" style="color:yellow; font-weight:bold">' + response.verification_uri + '</span><br/>'
                + '2) в поле ввода впиши Код устройства '
                + '<span id="uri" style="color:yellow; font-weight:bold">' + response.user_code + '</span> '
                + 'и тыкай "Активировать"<br/>'
                + '3) нажимай кнопочку, чтоб роботы его проверили<br/>'
                + '<button class="verify_device_token button" data-on__key_enter="getDeviceToken"><span>Готово, спускайте роботов</span></button>';
            Main.showSpinner(message);
        }
    },
    ignoreActivation: function() {
        // TODO handle ignored login (just browse favourites?)
    },
    getDeviceToken: function(response) {
        var session = Settings.getData('session');
        if (session.deviceCodeResponse === undefined
            || Kinopub.isExpired(session.deviceCodeResponse)
            || session.deviceCodeResponse.code === undefined
        ) {
            Kinopub.errorHandler('getDeviceToken error ' + session);
        }

        var params = {
            grant_type: 'device_token',
            client_id: Kinopub.client_id,
            client_secret: Kinopub.client_secret,
            code: session.deviceCodeResponse.code
        };
        // TODO When error happens here, tell it. Not just enable button, tell the error
        Kinopub.ajax(Kinopub.api_endpoint_oauth, params, 'post', Kinopub.deviceTokenHandler, Kinopub.errorHandler);
        Kinopub.authorization_pending_handler();
    },
    deviceTokenHandler: function(response){
        var session = Settings.getData('session');
        session.deviceTokenResponse = response;
        Settings.setData('session', session);
        var message = 'Это успех! Попросить роботов загрузить еще и каталог?<br />'
            + '<button class="button" data-on__key_enter="loadCatalog"><span>Да, пусть загрузят еще и каталог, пожалуйста.</span></button>';
        Main.showSpinner(message);
    },
    authorization_pending_handler: function() {
        var b = document.querySelector('#spinner .verify_device_token');
        if (b) {
            b.disabled = true;
            b.classList.add('disabled');
            var session = Settings.getData('session');
            var interval = session.deviceCodeResponse.interval * 1000 || 5000;
            var t = window.setTimeout(function(){
                var b = document.querySelector('#spinner .verify_device_token');
                if (b) {
                    b.disabled = false;
                    b.classList.remove('disabled');
                }
            }, interval);
        }
    },
    code_expired_handler: function() {
        Kinopub.login();
    },
    ajax: function(url, parameters, method, successHandler, errorHandler) {
        var data = null;
        var urlParameters = '';
        var token = '';
        var session = Settings.getData('session');
        parameters = parameters || {};
        for (p in parameters) {
            if (!parameters.hasOwnProperty(p)) { continue; }

            if (method === 'post') {
                if (data === null) {
                    data = new FormData();
                }
                data.append(p, parameters[p]);
            } else if (method === 'get') {
                urlParameters += '&' + p + '=' + encodeURIComponent(parameters[p]);
            }
        }

        if (method === 'get') {
            token = '?access_token=' + session.deviceTokenResponse.access_token;
        }

        var xhr = new XMLHttpRequest();
        xhr.successHandler = successHandler;
        xhr.errorHandler = errorHandler;
        xhr.open(method, url + token + urlParameters);
        xhr._requestTimestamp = Math.round(new Date().getTime() / 1000);
        xhr.onreadystatechange = Kinopub.ajaxStateChange;
        xhr.send(data);
    },
    ajaxStateChange: function(e){
        if (this.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        log(this.responseURL + '::' + this.readyState + '::' + this.status);
        var parsedResponse = JSON.parse(this.responseText);
        if (this.status !== 200 && this.errorHandler !== undefined) {
            var error = parsedResponse.error || 'error';
            var errorDescription = parsedResponse.error_description ? ' (' + parsedResponse.error_description + ')' : '';
            var message = error + errorDescription;
            this.errorHandler(message, error);
            return this;
        }

        parsedResponse._requestTimestamp = this._requestTimestamp;
        this.successHandler(parsedResponse);
    },
    errorHandler: function(message, error){
        log('Error:' + message);
        var errorHandler = error + '_handler';
        if (Kinopub[errorHandler] !== undefined && typeof Kinopub[errorHandler] === 'function') {
            Kinopub[errorHandler](message);
        }
    },
    loadCatalog: function(){
        Main.getScene('grid_scene').showAndLoadPage();
    },
    getTypesUrl: function(){
        return Kinopub.api_endpoint + 'types';
    },
    getGenresUrl: function(){
        return Kinopub.api_endpoint + 'genres';
    },
    getCountries: function() {},
    getItemsUrl: function()
    {
        return Kinopub.api_endpoint + 'items';
    },
    getItemUrl: function(id) {
        return Kinopub.api_endpoint + 'items/' + id
    },
    getPagersInfoFromResponse: function(response)
    {
        var pagers = {};
        if (response.pagination === undefined) { return pagers; }
        if (response.pagination.current !== 1) {
            pagers.left = response.pagination.current - 1;
        }
        if (response.pagination.current !== response.pagination.total) {
            pagers.right = response.pagination.current + 1;
        }
        return pagers;
    },
    getItemsFromResponse: function(response)
    {
        if (response.status !== 200) {
            throw Error('getItemsHandler response.status !== 200');
        }
        var gridItems = [];
        for (var i = 0; i < response.items.length; i++) {
            var gridItem = Kinopub.convertItemToGridItem(response.items[i]);
            gridItems.push(gridItem);
        }
        return gridItems;
    },
    convertItemToGridItem: function(item)
    {
        var gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.dataset.id = item.id;
        gridItem.dataset.title = item.title;
        gridItem.dataset.year = item.year;
        gridItem.dataset.on__key_enter = 'loadAndShowItemInfo';
        gridItem.style.backgroundColor = '#64194b';
        var miniInfo = document.createElement('div');
        miniInfo.classList.add('grid-mini-info');
        var kinoPubRating = item.rating || '-';
        var kinoPubViews = item.rating || '-';
        var imdbRating = item.imdb_rating || '-';
        var imdbVotes = item.imdb_votes || '-';
        var kinoPoiskRating = item.kinopoisk_rating || '-';
        var kinoPoiskVotes = item.kinopoisk_votes || '-';

        var miniInfoText =  item.type + '<br/>'
            + 'KinoPub:' + kinoPubRating + '<br/>'
            + 'KinoPub просмотров:' + kinoPubViews + '<br/>'
            + 'IMDB:' + imdbRating + '<br/>'
            + 'IMDB голосов:' + imdbVotes + '<br/>'
            + 'KinoPoisk:' + kinoPoiskRating + '<br/>'
            + 'KinoPoisk голосов:' + kinoPoiskVotes;

        widgetAPI.putInnerHTML(miniInfo, miniInfoText);
        gridItem.appendChild(miniInfo);

        var img = (item.posters !== undefined && item.posters.medium !== undefined) ? item.posters.medium : '';
        img = img.replace(/^https:/, 'http:');
        gridItem.style.backgroundImage = 'url("' + img + '")';

        return gridItem;
    }
};