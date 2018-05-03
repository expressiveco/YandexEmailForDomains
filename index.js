(function () {
    function getScript(src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onreadystatechange = s.onload = function () {
            if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
                callback.done = true;
                callback();
            }
        };
        document.querySelector('head').appendChild(s);
    }
    function parseQuery(qstr) {
        var query = {};
        var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
        for (var i = 0; i < a.length; i++) {
            var b = a[i].split('=');
            query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
        }
        return query;
    }
    var docCookies = {
        getItem: function (sKey) {
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!sKey || !this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: /* optional method: you can safely remove it! */ function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };
    function getStoredKeyword(keywordName) {
        return docCookies.getItem(keywordName);
    }
    function updateStoredKeyword(keywordName, value) {
        docCookies.setItem(keywordName, value);
    }
    function loadMain() {
        getScript('https://code.jquery.com/jquery-3.2.1.min.js', init);
    }

    loadMain();

    function init() {
        //initUI();

        var currentPage = parseInt(getStoredKeyword("__page"), 10) || 0;
        var domain;
        if (currentPage == 0) {
            currentPage = 1;
            domain = prompt("Enter domain name");
            if (domain == null)
                return;
            else {
                updateStoredKeyword("__domainName", domain);
            }
        }
        else
            domain = getStoredKeyword("__domainName");

        var domains = getAllDomains();
        var result = domains.filter(d => d.toLowerCase() == domain.toLowerCase());
        if (result.length > 0) {
            var $elm = $(`:contains(${domain})`)
            $elm.css('background-color', 'yellow');
            scrollIntoView($elm);            
            alert("Domain found");
            updateStoredKeyword("__page", 0);
            updateStoredKeyword("__domainName", "");            
            return;
        }

        var pageCount = parseInt(getPageCount(), 10);
        if (currentPage == pageCount) {
            updateStoredKeyword("__page", 0);
            updateStoredKeyword("__domainName", "");
            alert("Domain not found");
            return;
        }
        updateStoredKeyword("__page", ++currentPage);
        location.href = `https://kurum.yandex.com.tr/?p=${currentPage}`;
    }

    function getAllDomains() {
        var $domains = $('.b-domains__item h3.b-domain__name__text a');
        return $domains.map((i, e) => $(e).text()).get();
    }

    function getPageCount() {
        return $(".b-pager__pages [class^='b-pager__']").length;
    }

    function scrollIntoView($elem) {
        if (!isScrolledIntoView($elem))
            $elem[0].scrollIntoView();
    }
    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
}());
