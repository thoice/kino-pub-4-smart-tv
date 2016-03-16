OAuthDF = {};

// todo keep count of auth:init:call. Limit to 100 ?
/*
 * Flow:
 * If session HAS accessToken and it IS NOT expired, then return it
 * If session HAS accessToken and it IS expired and if session has refresh_token, then ajax to refresh it
 * If session DOES NOT HAVE accessToken and HAS device_code_response with user_code and code then ajax to get accessToken
 * If session DOES NOT HAVE accessToken and DOES NOT HAVE device_code_response then ajax to get device_code_response
 */

OAuthDF.doAuth = function () {
    log('OAuthDF.doAuth');
    var s = Settings.getData('session') || {};

    var atr = s['access_token_response'] || {access_token: null};
    var dcr = s['device_code_response'];
    var accessToken = atr['access_token'];
    if (accessToken && !Settings.expired(atr['_requestTimestamp'], atr['expires_in'])) {
        delete(s['device_code_response']);
        log('OAuthDF auth:access_token:success');
        document.body.dispatchEvent(new Event('auth:access_token:success'));
        return accessToken;
    } else if (accessToken && Settings.expired(atr['_requestTimestamp'], atr['expires_in'])) {
        // refresh accessToken
        delete(s['device_code_response']);
        log('OAuthDF auth:refresh_token');

        var refresh_token = atr.refresh_token || '';
        Settings.setData('session', s);
        if (refresh_token) {
            log('OAuthDF send ajax:refresh_token');
            return Main.ajax(
                Main.apier.getMethodFor('refresh_token'),
                Main.apier.getUrlFor('refresh_token'),
                Main.apier.getParametersFor('refresh_token', {refresh_token: refresh_token}),
                'refresh_token'
            );
        } else {
            log('OAuthDF missing refresh_token', 'error');
            //todo delete session and restart auth
        }
    } else if (dcr) {
        // try to get accessToken
        delete(s['access_token_response']);

        var userCode = dcr.user_code || '';
        var verificationUri = dcr.verification_uri || '';
        log('OAuthDF has device_code. Trying to validate it. user_code: ' + userCode + ' verification_uri: ' + verificationUri);
        Settings.setData('session', s);
        if (userCode && verificationUri) {
            var message = 'Пользование сайтом вне браузера доступно только Pro аккаунтам. '
                + 'Как раз твой случай? Тогда вот что:<br/>'
                + '1) зайди по адресу '
                + '<span id="code" style="color:yellow; font-weight:bold">' + verificationUri + '</span><br/>'
                + '2) в поле ввода впиши Код устройства '
                + '<span id="uri" style="color:yellow; font-weight:bold">' + userCode + '</span> '
                + 'и тыкай "Активировать"<br/>'
                + '3) нажимай кнопочку, чтоб роботы его проверили<br/>';
            var buttonLabel = 'Готово, спускайте роботов';
            Main.showModal(message, buttonLabel, 'ajax:access_token:request');
        }
    } else {
        // query for device_code
        delete(s['access_token_response']);
        log('OAuthDF does not have device_code. Trying to get it');
        log('OAuthDF send ajax:device_code');
        Settings.setData('session', s);
        return Main.ajax(
            Main.apier.getMethodFor('device_code'),
            Main.apier.getUrlFor('device_code'),
            Main.apier.getParametersFor('device_code'),
            'device_code'
        );
    }
};

OAuthDF.deviceCodeSuccess = function (e) {
    log('OAuthDF ajax:device_code:success');
    var s = Settings.getData('session');
    s['device_code_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.accessTokenRequest = function (e) {
    // todo disable button 
    var s = Settings.getData('session') || {};
    var dcr = s['device_code_response'] || {code: ''};
    var code = dcr['code'];

    Main.ajax(
        Main.apier.getMethodFor('access_token'),
        Main.apier.getUrlFor('access_token'),
        Main.apier.getParametersFor('access_token', {code: code}),
        'access_token'
    );
};

OAuthDF.accessTokenSuccess = function (e) {
    /* todo response = {scope: null, token_type: "bearer" } */
    log('OAuthDF ajax:access_token:success');
    var s = Settings.getData('session');
    s['access_token_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.refreshTokenSuccess = function (e) {
    /* todo response = {scope: null, token_type: "Bearer" } */
    log('OAuthDF ajax:refresh_token:success');
    var s = Settings.getData('session');
    s['access_token_response'] = e.parsedResponse;
    Settings.setData('session', s);
    document.body.dispatchEvent(new Event('auth:init:call'));
};

OAuthDF.error = function (e) {
    // todo "bad_verification_code" ?
    // todo "code_expired" "The authorization code has expired"
    var errorResponse = e.parsedResponse || {error: 'error'};
    var errorCode = errorResponse.error || 'error';
    var s = Settings.getData('session');
    switch (errorCode) {
        case 'authorization_pending':
            delete(s['access_token_response']);
            var dcr = s['device_code_response'];
            var userCode = dcr.user_code || '';
            var code = dcr.code || '';
            var verificationUri = dcr.verification_uri || '';
            if (userCode && verificationUri) {
                // todo enable button in 5 seconds
                var message = 'И все же, проделай следующее. Как уже мы выяснили раньше, ' +
                    'пользование сайтом вне браузера доступно только Pro аккаунтам. ' +
                    'Как раз твой случай? Тогда вот что:<br/>' +
                    '1) зайди по адресу ' +
                    '<span id="code" style="color:yellow; font-weight:bold">' + verificationUri + '</span><br/>' +
                    '2) в поле ввода впиши Код устройства ' +
                    '<span id="uri" style="color:yellow; font-weight:bold">' + userCode + '</span> ' +
                    'и тыкай "Активировать"<br/>' +
                    '3) нажимай кнопочку, чтоб роботы его проверили<br/>';
                var buttonLabel = 'Теперь точно готово, пробуем опять';
                Main.showModal(message, buttonLabel, 'ajax:access_token:request');
            }

            break;
        case 'error':
        default:
            delete(s['device_code_response']);
            delete(s['access_token_response']);
            break;
    }

    Settings.setData('session', s);
    log('error:[' + e.parsedResponse.error + '] description:[' + e.parsedResponse.error_description + ']', 'error');
};

document.body.addEventListener('auth:init:call', OAuthDF.doAuth, false);

document.body.addEventListener('ajax:device_code:success', OAuthDF.deviceCodeSuccess, false);

document.body.addEventListener('ajax:access_token:request', OAuthDF.accessTokenRequest, false);
document.body.addEventListener('ajax:access_token:success', OAuthDF.accessTokenSuccess, false);
document.body.addEventListener('ajax:access_token:error', OAuthDF.error, false);

document.body.addEventListener('ajax:refresh_token:success', OAuthDF.refreshTokenSuccess, false);
document.body.addEventListener('ajax:refresh_token:error', OAuthDF.error, false);


