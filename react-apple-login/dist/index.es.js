import React, { useEffect } from 'react';

var generateQueryString = function (q) {
    var queryString = '';
    if (q) {
        var queryKeys = Object.keys(q);
        queryKeys.forEach(function (key) {
            if (q[key]) {
                if (q[key].toString().length) {
                    queryString += key + "=" + q[key] + "&";
                }
            }
        });
        if (queryKeys.length > 0 && queryString[queryString.length - 1] === '&') {
            queryString = queryString.slice(0, -1);
        }
    }
    return queryString;
};

var AppleLogin = function (props) {
    var clientId = props.clientId, redirectURI = props.redirectURI, _a = props.state, state = _a === void 0 ? '' : _a, render = props.render, _b = props.designProp, designProp = _b === void 0 ? {} : _b, _c = props.responseMode, responseMode = _c === void 0 ? 'query' : _c, _d = props.responseType, responseType = _d === void 0 ? 'code' : _d, nonce = props.nonce, callback = props.callback, scope = props.scope;
    useEffect(function () {
        if (typeof callback === 'function' && responseMode === 'query' && responseType === 'code' && window && window.location) {
            var match = void 0;
            var pl_1 = /\+/g, // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl_1, " ")); }, query = window.location.search.substring(1);
            var urlParams = {};
            while (match = search.exec(query)) {
                urlParams[decode(match[1])] = decode(match[2]);
            }
            if (urlParams['code']) {
                callback({
                    code: urlParams['code']
                });
            }
        }
        return function () {
        };
    }, []);
    var onClick = function (e) {
        if (e) {
            e.preventDefault();
        }
        window.location.href = "https://appleid.apple.com/auth/authorize?" + generateQueryString({
            response_type: responseType,
            response_mode: responseMode,
            client_id: clientId,
            redirect_uri: encodeURIComponent(redirectURI),
            state: state,
            nonce: nonce,
            scope: responseMode === 'query' ? '' : scope
        });
    };
    if (typeof render === 'function') {
        return render({ onClick: onClick });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "appleid-signin", onClick: onClick },
            React.createElement("img", { src: "https://appleid.cdn-apple.com/appleid/button?" + generateQueryString(designProp) }))));
};

export default AppleLogin;
//# sourceMappingURL=index.es.js.map
