Info = {
    id: 'info_wrapper',
    l: null,
    init: function () {
        log('Info.init');
        Info.l = document.querySelector('#' + Info.id);
        Main.addScene(Info.id, Info);
        document.body.addEventListener('info:load', Info.load, false);
        document.body.addEventListener('ajax:item_get_info:success', Info.loadSuccess, false);
    },
    load: function (e) {
        log('Info.load');
        var srcL = findChildWithClass(e.l, 'grid-item');
        if (!srcL || !srcL.dataset || !srcL.dataset.id) {
            log('Info.load failed', 'error');
        }
        var itemId = srcL.dataset.id;
        Main.showScene(Info.id);
        // todo Main.showSpinner('Роботы работают еще усерднее и сейчас мы узнаем подробности');
        Main.ajax({
            call_name: 'item_get_info',
            parameters: {id: itemId}
        });
    },
    loadSuccess: function (e) {
        if (!e || !e.parsedResponse || e.parsedResponse.item) {
            // todo throw error
        }
        var item = e.parsedResponse.item;
        Info.renderInfo(item);
    },
    renderInfo: function (item) {
        var descriptionElement = document.querySelector('#info_wrapper #info_description');
        var videosElement = document.querySelector('#info_wrapper #info_videos');
        widgetAPI.putInnerHTML(descriptionElement, '');
        widgetAPI.putInnerHTML(videosElement, '');

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
            var infoPosterWrapper = Info.l.querySelector('#info_poster');
            widgetAPI.putInnerHTML(infoPosterWrapper, '');
            infoPosterWrapper.appendChild(poster);
        }

        var videoLinks = Info.createVideoRows(item);
        for (var v = 0; v < videoLinks.length; v++) {
            var videoLinksRow = videoLinks[v];
            videosElement.appendChild(videoLinksRow);
        }

        var detailsWrapper = document.createElement('div');
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
        descriptionElement.appendChild(title);

        for (i in itemsToRender) {
            if (!itemsToRender.hasOwnProperty(i)) {
                continue;
            }
            if (!item.hasOwnProperty(i)) {
                continue;
            }
            var infoRow = Info.createInfoRow(itemsToRender[i], item[i]);
            detailsWrapper.appendChild(infoRow);
        }
        descriptionElement.appendChild(detailsWrapper);
        var focus = followClassCrumbs('kbdbl-focused');
        if (focus) {
            focus.focus();
        }
        // TODO IMDB link item.imdb
        // TODO kinopoisk link item.kinopoisk
    },
    createVideoRows: function (item) {
        var videoLinks = [];
        var isOdd = false;
        var rowData;
        var title;
        var row;
        switch (item.type) {
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
                    row = Info.createVideoRow(rowData);
                    videoLinks.push(row);
                }
                break;
            case 'serial':
            case 'docuserial':
                // item[seasons][0][episodes][0][duration]
                // item[seasons][0][episodes][0][files][0][quality] = "480p"
                // item[seasons][0][episodes][0][files][0][url][http] = "http://..."
                var seasonEpisodeIndex = 0;
                for (var s = 0; s < item.seasons.length; s++) {
                    var season = item.seasons[s];
                    for (var e = 0; e < season.episodes.length; e++) {
                        rowData = season.episodes[e];
                        title = 's' + season.number + 'e' + rowData.number;
                        isOdd ^= true;
                        row = Info.createVideoRow(rowData, title, isOdd, seasonEpisodeIndex);
                        seasonEpisodeIndex++;
                        videoLinks.push(row);
                    }
                }

                break;
            default:
                break;
        }
        return videoLinks;
    },
    createVideoRow: function (rowData, rowTitle, isOdd, index) {
        var row = document.createElement('div');
        row.classList.add('info-video-row');
        row.classList.add('kbdbl-row');
        row.classList.add('kbdbl-y-' + index);
        if (index === 0) {
            row.classList.add('kbdbl-focused');
        }
        row.dataset.kbdblY = index;
        if (isOdd) {
            row.classList.add('odd');
        }

        var file;
        for (var f = 0; f < rowData['files'].length; f++) {
            file = rowData['files'][f];
            var button = document.createElement('button');
            button.tabIndex = -1;
            button.classList.add('button');
            button.classList.add('kbdbl');
            button.classList.add('kbdbl-x-' + f);
            if (f === 0 && (index === 0 || index === undefined)) {
                button.classList.add('kbdbl-focused');
            }
            button.dataset.kbdblX = f;
            button.dataset.onKeyEnter = 'player:video:play';
            var btnText = document.createElement('span');
            btnText.textContent = file['quality'];
            button.appendChild(btnText);
            button.dataset.url = file['url']['http'];
            button.dataset.duration = rowData['duration'];
            button.dataset.title = rowTitle || '';
            row.appendChild(button);
        }
        if (rowTitle) {
            var title = document.createElement('span');
            title.textContent = rowTitle;
            title.classList.add('info-row-title');
            row.appendChild(title);
        }

        var duration = document.createElement('span');
        duration.classList.add('info-video-duration');
        duration.textContent = secondsToDuration(rowData['duration']);
        row.appendChild(duration);
        return row;
    },
    createInfoRow: function (labelText, text) {
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
    }
};

document.addEventListener('DOMContentLoaded', Info.init, false);