Info = function(id) {
    this.id = id;
    this.e = document.getElementById(id);
    this.footerHtml = '<div class="footer-group"><img class="footer-icon" src="./res/left_right.png"><span class="footer-text"> = Список видео / Информация</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/channel.png"><span class="footer-text"> = Прокрутка содержимого</span></div> '
        + '<div class="footer-group"><img class="footer-icon" src="./res/enter.png"><span class="footer-text"> = Запуск выбранного видео</span></div>';
    this.descriptionElement = document.querySelector('#' + id + ' #info_description');
    this.videosElement = document.querySelector('#' + id + ' #info_videos');
    this.parameters = {};

    /**
     * Show spinner, launch ajax
     *
     * @param element
     */
    this.showAndLoad = function (element) {
        log('Info.showAndLoad');
        Main.showScene('info_scene');
        Main.showSpinner('Роботы работают еще усерднее и сейчас мы узнаем подробности');

        var itemId = element.dataset.id;
        Main.apier.ajax(Main.apier.getItemUrl(itemId), this.parameters, 'get', this.loadHandler);
    };

    /**
     * Load handler and renderer of response
     *
     * @param response
     */
    this.loadHandler = function(response) {
        var info = Main.getScene('info_scene');
        info.renderItem(response.item);
        Main.hideSpinner();
        log('Grid.loadHandler complete');
    };

    /**
     * Called on scene show.
     * Updates footer with usage tips
     *
     * @param e
     */
    this.onShow = function (e) {
        var footer = document.getElementById('footer');
        var info = Main.getScene('info_scene');
        widgetAPI.putInnerHTML(footer, info.footerHtml);
    };

    /**
     * Show info scene, fill and render info and videos tabs
     *
     * @param item
     */
    this.renderItem = function(item) {
        widgetAPI.putInnerHTML(this.descriptionElement, '');
        widgetAPI.putInnerHTML(this.videosElement, '')

        var posterImg = '';
        if (item['posters'] !== undefined) {
            if (item['posters']['big'] !== undefined) {
                posterImg = item['posters']['big'];
            } else if (item['posters']['medium'] !== undefined) {
                posterImg = item['posters']['medium'];
            } else if (item['posters']['small'] !== undefined) {
                posterImg = item['posters']['small'];
            }
        }

        if (posterImg) {
            posterImg = posterImg.replace(/^https:/, 'http:');
            var poster = document.createElement('img');
            poster.src = posterImg;
            poster.classList.add('info-poster');
            var infoPosterWrapper = this.e.querySelector('#info_poster');
            widgetAPI.putInnerHTML(infoPosterWrapper, '');
            infoPosterWrapper.appendChild(poster);
        }

        var videoLinks = this.createVideoRows(item);
        for (var v = 0; v < videoLinks.length; v++) {
            var videoLinksRow = videoLinks[v];
            this.videosElement.appendChild(videoLinksRow);
        }

        var details_wrapper = document.createElement('div');
        var itemsToRender = {
            year: 'Год',
            genres: 'Жанры',
            plot: 'Описание',
            director: 'Режисер',
            countries: 'Страны',
            cast: 'В ролях',
            imdb_rating: 'IMDB',
            rating: 'Рейтинг'
        };

        var title = document.createElement('p');
        title.classList.add('info-title');
        title.classList.add('info-text');
        title.textContent = item.title;
        this.descriptionElement.appendChild(title);

        for (i in itemsToRender) {
            if (!itemsToRender.hasOwnProperty(i)) { continue; }
            if (!item.hasOwnProperty(i)) { continue; }
            var infoRow = this.createInfoRow(itemsToRender[i], item[i]);
            details_wrapper.appendChild(infoRow);
        }
        this.descriptionElement.appendChild(details_wrapper);
        // TODO IMDB link item.imdb
        // TODO kinopoisk link item.kinopoisk
    };

    /**
     * Create info row in info tab
     *
     * @param labelText
     * @param text
     * @returns {Element}
     */
    this.createInfoRow = function(labelText, text)
    {
        var label = document.createElement('label');
        label.classList.add('info-header');
        label.textContent = labelText + ': ';
        if (text instanceof Array) {
            var jointText = [];
            for (var t = 0; t < text.length; t++) {
                jointText.push(text[t]['title']);
            }
            text = jointText.join(', ');
        }
        var textSpan = document.createElement('span');
        textSpan.classList.add('info-text');
        widgetAPI.putInnerHTML(textSpan, text);
        label.appendChild(textSpan);
        return label;
    };

    /**
     * Fill in videos tab
     *
     * @param item
     * @returns {Array}
     */
    this.createVideoRows = function(item)
    {
        var videoLinks = [];
        var isOdd = false;
        var rowData;
        var title;
        switch(item.type) {
            case 'movie':
            case 'documovie':
            case '3D':
            case 'concert':
                // item[videos][0][duration]
                // item[videos][0][files][0][quality] = "480p"
                // item[videos][0][files][0][url][http] = "http://..."
                // item[videos][0][files][1][quality] = "720p"
                // item[videos][0][files][1][url][http] = "http://..."
                for (var v = 0; v < item['videos'].length; v++) {
                    rowData = item['videos'][v];
                    var row = this.createVideoRow(rowData);
                    videoLinks.push(row);
                }
                break;
            case 'serial':
            case 'docuserial':
                // item[seasons][0][episodes][0][duration]
                // item[seasons][0][episodes][0][files][0][quality] = "480p"
                // item[seasons][0][episodes][0][files][0][url][http] = "http://..."
                for (var s = 0; s < item.seasons.length; s++) {
                    var season = item.seasons[s];
                    for (var e = 0; e < season.episodes.length; e++) {
                        rowData = season.episodes[e];
                        title = 's' + season.number + 'e' + rowData.number;
                        isOdd ^= true;
                        var row = this.createVideoRow(rowData, title, isOdd);
                        videoLinks.push(row);
                    }
                }

                break;
            default:
                break;
        }
        return videoLinks;
    };

    /**
     * Create video row in videos tab
     *
     * @param rowData
     * @param rowTitle
     * @param isOdd
     * @returns {Element}
     */
    this.createVideoRow = function(rowData, rowTitle, isOdd)
    {
        var row = document.createElement('div');
        row.classList.add('video-row');
        if (isOdd) {
            row.classList.add('odd');
        }
        var file;
        for (var f = 0; f < rowData['files'].length; f++) {
            file = rowData['files'][f];
            var button = document.createElement('button');
            button.classList.add('button');
            button.dataset.on__key_enter = 'playVideo';
            var btnText = document.createElement('span');
            btnText.textContent = file['quality'];
            button.appendChild(btnText);
            button.dataset.url = file['url']['http'];
            button.dataset.duration = rowData['duration'];
            row.appendChild(button);
        }
        if (rowTitle) {
            var title = document.createElement('span');
            title.textContent = rowTitle;
            title.classList.add('row-title');
            row.appendChild(title);
        }

        var duration = document.createElement('span');
        duration.classList.add('info-video-duration');
        duration.textContent = Utils.secondsToDuration(rowData['duration']);
        row.appendChild(duration);
        return row;
    };

    /**
     * Show player scene, show player and play video
     *
     * @param videoElement
     */
    this.playVideo = function(videoElement)
    {
        var url = videoElement.dataset.url;
        var duration = videoElement.dataset.duration;
        Main.pushToFocusStack(this, videoElement);
        Main.getScene('player_scene').showAndPlay(url, duration);
    };

    /**
     * Make next tab active
     *
     * @param element
     */
    this.activateTab = function(element)
    {
        var oldTab= element.parentNode.querySelector('.info-tab-header.active');
        if (oldTab) {
            oldTab.classList.remove('active');
        }
        element.classList.add('active');
    };

    /**
     * Switch through tabs
     *
     * @param element
     * @param event
     */
    this.onKeyRight = function(element, event)
    {
        var scene = Main.getScene('info_scene');
        var tabs = scene.e.querySelectorAll('.info-tab-header');
        for (var t = 0; t < tabs.length; t++) {
            var tab = tabs[t];
            if (tab.classList.contains('active')) {
                tab.classList.remove('active');
            } else {
                tab.classList.add('active');
            }
        }
    };

    /**
     * Switch through tabs
     *
     * @param element
     * @param event
     */
    this.onKeyLeft = function(element, event)
    {
        var scene = Main.getScene('info_scene');
        var tabs = scene.e.querySelectorAll('.info-tab-header');
        for (var t = 0; t < tabs.length; t++) {
            var tab = tabs[t];
            if (tab.classList.contains('active')) {
                tab.classList.remove('active');
            } else {
                tab.classList.add('active');
            }
        }
    };

    /**
     * Scroll active tab content down
     *
     * @param element
     * @param event
     */
    this.onKeyChDown = function(element, event)
    {
        var s = Main.getActiveScene()
        var tabContent = s.e.querySelector('.active + .info-tab-content-wrapper > .info-tab-content')
        tabContent.scrollTop += 550;
    };

    /**
     * Scroll active tab content up
     *
     * @param element
     * @param event
     */
    this.onKeyChUp = function(element, event)
    {
        var s = Main.getActiveScene()
        var tabContent = s.e.querySelector('.active + .info-tab-content-wrapper > .info-tab-content')
        tabContent.scrollTop -= 550;
    };
    // TODO on key_down => process keyboard event (focus to lower video row element + scrollToViewifNeeded)
};