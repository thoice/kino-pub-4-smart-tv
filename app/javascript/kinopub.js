Kinopub = {
    urls: {
        base: {},
        device_code: {
            method: 'post',
            url: 'http://api.kino.pub',
            path: '/oauth2/device',
            params: {
                grant_type: 'device_code',
                client_id: 'duna',
                client_secret: 'ha19qtm5utnjmj8csv8st3zxefrwpuyk'
            }
        },
        access_token: {
            method: 'post',
            url: 'http://api.kino.pub',
            path: '/oauth2/device',
            params: {
                grant_type: 'device_token',
                client_id: 'duna',
                client_secret: 'ha19qtm5utnjmj8csv8st3zxefrwpuyk',
                code: null
            }
        },
        refresh_token: {
            method: 'post',
            url: 'http://api.kino.pub',
            path: '/oauth2/token',
            params: {
                grant_type: 'refresh_token',
                client_id: 'duna',
                client_secret: 'ha19qtm5utnjmj8csv8st3zxefrwpuyk',
                refresh_token: null
            }
        },
        grid_get_items: {
            url: 'http://api.kino.pub/v1',
            path: '/items'
        }
    },
    getMethodFor: function (key) {
        var urlDefinition = Kinopub.urls[key] ? Kinopub.urls[key] : {};
        return urlDefinition['method'] ? urlDefinition['method'] : 'get';
    },
    getParametersFor: function (key, appendParams) {
        var urlDefinition = Kinopub.urls[key] ? Kinopub.urls[key] : {};
        var returnParams, param;
        var params = urlDefinition['params'] || {};

        for (var attrName in appendParams) {
            if (!appendParams.hasOwnProperty(attrName)) {
                continue;
            }
            params[attrName] = appendParams[attrName];
        }

        if (!urlDefinition['method'] || urlDefinition['method'].toLowerCase() === 'get') {
            var pairs = [];

            for (param in params) {
                if (!params.hasOwnProperty(param) || params[param] === null) {
                    continue
                }
                var k = encodeURIComponent(param),
                    v = encodeURIComponent(params[param]);
                pairs.push(k + "=" + v);
            }

            returnParams = pairs.join("&");
        } else {
            returnParams = new FormData();
            for (param in params) {
                if (!params.hasOwnProperty(param)) {
                    continue
                }
                returnParams.append(param, params[param]);
            }
        }
        return returnParams;
    },
    getUrlFor: function (key) {
        var urlDefinition = Kinopub.urls[key] ? Kinopub.urls[key] : {};
        var baseUrl = (Kinopub.urls['base'] && Kinopub.urls['base']['url']) ? Kinopub.urls['base']['url'] : '';
        var url = urlDefinition['url'] ? urlDefinition['url'] : baseUrl;

        url += urlDefinition['path'] ? urlDefinition['path'] : '';

        return url;
    }
};

