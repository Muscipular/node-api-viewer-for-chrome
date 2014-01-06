function parseDocument(doc) {
//    console.log(doc);
    $('.module-list').html(doc.toc).find('li').addClass('close');
    $('.viewer').html(doc.content);

    highlight(undefined, undefined, 'pre');
}

function loadDocument(version) {
    $('.module-list').html('');
    $('.viewer').html('');
    chrome.storage.local.get(version, function (doc) {
//        console.log(doc);
        if (doc && doc[version]) {
            parseDocument(doc[version]);
        } else {
            $.get('http://nodejs.org/docs/' + version + '/api/all.html')
                .then(function (result) {
                    var defer = $.Deferred();
                    var head = result.match(/<head>[\w\W]+<\/head>/i);
                    var html = result.match(/<body[^>]*>([\w\W]+)<\/body>/i)[1];
                    html = $('<div></div>').html(html);
                    html.find('script').remove();
                    html.find('#toc').find('h2').remove();
                    var doc = {
                        toc: html.find('#toc').html(),
                        content: html.find('#apicontent').html()
                    };
                    var obj = {};
                    obj[version] = doc;
                    chrome.storage.local.set(obj);
                    return doc;
                })
                .then(parseDocument)
        }
    });
}

loadDocument('v0.10.24');

$(document)
    .delegate('.module-list a', 'click', function (e) {
        e.stopPropagation();
        $('.module-list > ul > li').addClass('close');
        $(e.target).parents().removeClass('close');
    })
    .delegate('.module-list a', 'dblclick', function (e) {
//        $('.module-list > ul > li').addClass('close');
        e.stopPropagation();
        $(e.target).parent().addClass('close');
    })
    .delegate('.filter', 'focus', function (e) {
        e.target.timer = setInterval(function () {
            $('.filter').trigger('change')
        }, 500);
    })
    .delegate('.filter', 'blur', function (e) {
        clearInterval(e.target.timer);
    })
    .delegate('.filter', 'change', function (e) {
        var $target = $(e.target);
        var val = $target.val();
        console.log(val);
        if (val) {
            $('.module-list').find('li').addClass('hidden').addClass('close');
            var list = $('.module-list a').filter(function (i) {
                return $(this).text().toLowerCase().indexOf(val.toLowerCase()) > -1;
            }).removeClass('hidden');
            list.each(function (i,v) {
                var $this = $(v).removeClass('hidden');
                $this.parent().find('*').removeClass('hidden');
                $this.parents().removeClass('hidden').removeClass('close');
            })
        } else {
            $('.module-list *').removeClass('hidden');
        }
    });