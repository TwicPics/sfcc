'use strict';

var server = require('server');

server.get('Image', function (req, res, next) {
    var TwicImgModel = require('*/cartridge/models/twicImg');
    var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');
    var ImageTwicpics = require('*/cartridge/scripts/helpers/ImageTwicpics');
    var version = twicpicsHelpers.isTwicpicsEnabled();
    var imgObj = req.querystring;

    if (!Object.hasOwnProperty.call(imgObj, 'src')) {
        throw new Error('Src field is required.');
    }

    if (version === 'expert') {
        imgObj = new TwicImgModel(imgObj);
    } else if (version && !imgObj.src.includes(twicpicsHelpers.domain)) {
        var imgTwic = new ImageTwicpics(imgObj, imgObj.imageType, 'large');
        imgObj.src = imgTwic.url;
    }

    res.render('twicpics', {
        twicpicsImg: imgObj,
        version: version
    });
    next();
});

module.exports = server.exports();
