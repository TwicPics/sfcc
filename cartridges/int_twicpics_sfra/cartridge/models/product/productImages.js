'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var ImageTwicpics = require('*/cartridge/scripts/helpers/ImageTwicpics');
var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');

/**
 * @constructor
 * @classdesc Returns images for a given product
 * @param {dw.catalog.Product} product - product to return images for
 * @param {Object} imageConfig - configuration object with image types
 */
function Images(product, imageConfig) {
    imageConfig.types.forEach(function (type, index) {
        var result = {};

        if (imageConfig.quantity === 'single') {
            var firstImage = new ImageTwicpics(product, twicpicsHelpers.IMAGE_TYPE.CATALOG, type, index);
            if (firstImage) {
                result = [{
                    alt: firstImage.alt,
                    url: firstImage.url,
                    title: firstImage.title,
                    index: firstImage.index
                }];
            }
        } else {
            var images = ImageTwicpics.getImages(product, twicpicsHelpers.IMAGE_TYPE.CATALOG, type, index);
            result = collections.map(images, function (image) {
                return {
                    alt: image.alt,
                    url: image.url,
                    title: image.title,
                    index: image.index,
                    twicImg: image.expertMode ? {
                        twicSrc: image.twicSrc ? 'data-twic-src=' + image.twicSrc : '',
                        twicFocus: image.twicFocus ? 'data-twic-focus=' + image.twicFocus : '',
                        twicStep: image.twicStep ? 'data-twic-step=' + image.twicStep : '',
                        bgStyle: image.bgStyle,
                        apiRatio: image.apiRatio,
                        transition: image.transition ? 'twic-img--fade' : '',
                        imgStyle: image.imgStyle
                    } : null
                };
            });
        }
        this[type] = result;
    }, this);
}

module.exports = Images;
