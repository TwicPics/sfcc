'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');

server.append('ShowQuickView', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');
    var viewData = res.getViewData();
    var product = viewData.product;
    var images = product.images;
    var version = twicpicsHelpers.isTwicpicsEnabled();

    Object.keys(images).forEach(function (viewType) {
        for (var i = 0; i < images[viewType].length; i++) {
            var image = images[viewType][i];
            image.twicpicsImg = {
                class: 'd-block img-fluid',
                title: image.title,
                src: image.url,
                urlImg: image.url,
                alt: image.alt + ' image number ' + image.index,
                itemprop: 'image',
                bgStyle: image.twicImg ? image.twicImg.bgStyle : undefined,
                transition: image.twicImg ? image.twicImg.transition : undefined,
                twicSrc: image.twicImg ? image.twicImg.twicSrc.replace('data-twic-src=', '') : undefined,
                apiRatio: image.twicImg ? image.twicImg.apiRatio : undefined
            };
        }
    });
    res.setViewData({
        product: product,
        version: version,
        isShowQuickView: true
    });
    next();
});

module.exports = server.exports();
