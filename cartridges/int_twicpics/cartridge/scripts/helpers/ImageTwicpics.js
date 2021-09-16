/* eslint-disable no-undef */
'use strict';

var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');
var ProductVariationAttributeValue = require('dw/catalog/ProductVariationAttributeValue');
var ProductVariationModel = require('dw/catalog/ProductVariationModel');
var Product = require('dw/catalog/Product');
var File = require('dw/io/File');
var Logger = require('dw/system/Logger');
var ArrayList = require('dw/util/ArrayList');
var collections = require('*/cartridge/scripts/util/collections');
var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');

/**
 * Initializes the ImageTwicpics wrapper object
 *
 * @param {dw.catalog.Product} imageObject Product or ProductVariationAttributeValue (required)
 * @param {string} imageType image type to get : catalog / content / static (required)
 * @param {string} viewType type of view (resolution) that should be generated
 * @param {number} index Number position of the image in the list of images for the view type. Defaults to 0 if not provided
 */
function ImageTwicpics(imageObject, imageType, viewType, index) {
    if (!imageObject || !imageType) {
        return;
    }

    this.referenceType = null;
    this.imageURL = null;
    this.url = null;
    this.alt = null;
    this.title = null;
    this.scalableViewType = null;
    this.viewType = viewType;
    this.imageType = imageType;
    this.imageObject = imageObject;
    this.index = index || 0;
    this.transformations = {};
    this.image = this.getImage();

    if (twicpicsHelpers.isTwicpicsEnabled() !== 'standard' && twicpicsHelpers.isTwicpicsEnabled() !== 'advanced') {
        return;
    }

    try {
        this.imageURL = this.setImageURL();
        this.url = this.imageURL;
        this.transformations = this.getTransformations();
        this.imageVersion = this.setImageScriptVersion();
        this.imageTransformations = this.setImageTransformations();
        this.url = this.imageURL + '?' + this.imageVersion;

        if (this.imageTransformations) {
            this.url += File.SEPARATOR + this.imageTransformations;
        }
        if (this.imageType === twicpicsHelpers.IMAGE_TYPE.CATALOG) {
            this.alt = this.getAlt();
            this.title = this.getTitle();
        }
    } catch (e) {
        this.url = URLUtils.staticURL('images/noimagelarge.png').toString();

        this.Logger.error('You have an error on the Twicpics cartridge : {0}', e.message);
    }
}


ImageTwicpics.prototype.scriptVersion = 'twic';
ImageTwicpics.prototype.Logger = Logger.getLogger('Twicpics', 'Twicpics');

/**
 * Get the Twicpics script version
 * @returns {string} script version
 */
ImageTwicpics.prototype.getScriptVersion = function () {
    var scriptVersion = Site.current.getCustomPreferenceValue('TWICScriptVersion');

    if (!scriptVersion) throw new Error('The field TWICScriptVersion is empty');

    return scriptVersion;
};

/**
 * Parse the JSON of the organization preference TWICTransformations
 * @returns {Object} JSON parse
 */
ImageTwicpics.prototype.getTransformations = function () {
    var transformations = Site.current.getCustomPreferenceValue('TWICTransformations');

    if (!transformations) return '';

    return JSON.parse(transformations);
};

ImageTwicpics.prototype.getImage = function () {
    var img = this.imageObject;

    if (this.imageType !== twicpicsHelpers.IMAGE_TYPE.CATALOG) {
        this.url = this.imageObject;
    } else {
        this.referenceType = 'Product';
        var getImage = false;

        if (this.imageObject instanceof ProductVariationAttributeValue) {
            this.referenceType = 'ProductVariationAttributeValue';
            getImage = true;
        } else if (this.imageObject instanceof ProductVariationModel) {
            this.imageObject = this.imageObject.selectedVariants.length > 0 ? this.imageObject.selectedVariants[0] : this.imageObject.master;
            getImage = true;
        } else if (this.imageObject instanceof Product) {
            getImage = true;
        }

        if (getImage) {
            img = this.imageObject.getImage(this.viewType, this.index);
        }


        if (img) {
            if (getImage) {
                this.url = img.getURL();
                this.alt = img.getAlt();
                this.title = img.getTitle();
            } else {
                this.url = Object.hasOwnProperty.call(img, 'src') ? img.src : '';
                this.alt = Object.hasOwnProperty.call(img, 'alt') ? img.alt : '';
                this.title = Object.hasOwnProperty.call(img, 'title') ? img.title : '';
            }
        }
    }

    return img;
};


/**
 * Set an URL string on the Twicpics format
 * Example : https://[host]/catalogs/images/medium/90011212_001_0.jpg
 * @returns {string} Twicpics URL
 */
ImageTwicpics.prototype.setImageURL = function () {
    if (!this.image) return '';

    var image = null;

    if (Object.hasOwnProperty.call(this.image, 'src')) {
        image = this.image.src;
    } else if (!Object.hasOwnProperty.call(this.image, 'getURL')) {
        image = this.image.toString();
    } else {
        image = this.image.getURL().toString();
    }

    return twicpicsHelpers.getTwicpicsImageUrl(image, this.imageType);
};

/**
 * Set a string with the script version into TWICScriptVersion
 * Example : twic=v1
 * @returns {string} Twicpics format version
 */
ImageTwicpics.prototype.setImageScriptVersion = function () {
    var scriptVersion = this.getScriptVersion();

    return this.scriptVersion + '=' + scriptVersion;
};

/**
 * Set a string with all parameters into the JSON TWICTransformations
 * Example : resize=50p/focus=20x10
 * @returns {string} Twicpics format paramters
 */
ImageTwicpics.prototype.setImageTransformations = function () {
    var tab = [];
    var transformations = null;

    if (!this.transformations) return '';

    if (
        Object.prototype.hasOwnProperty.call(this.transformations, 'viewTypeMapping')
        && this.transformations.viewTypeMapping[this.viewType]
    ) {
        this.scalableViewType = this.transformations.viewTypeMapping[this.viewType];
    }

    if (!this.scalableViewType) return '';

    transformations = this.transformations[this.scalableViewType];

    if (!transformations) { return ''; }

    Object.keys(transformations).forEach(function (transformation) {
        tab.push(transformation + '=' + transformations[transformation]);
    });

    return tab.join(File.SEPARATOR);
};

/**
 * Get text for title
 * @returns {string} title text
 */
ImageTwicpics.prototype.getTitle = function () {
    if (this.imageObject === null) {
        return '';
    }

    if (this.referenceType === 'ProductVariationAttributeValue' && this.viewType === 'swatch') {
        return this.imageObject.displayValue;
    }

    if (!this.image || !this.image.title) {
        if (this.referenceType === 'Product') {
            return this.imageObject.name;
        } else if (
            this.transformations
            && this.transformations.missingImageTitle
        ) {
            return this.transformations.missingImageTitle;
        }

        return this.imageObject.displayValue;
    }

    return this.image.title;
};


/**
 * Get text for alt
 * @returns {string} alt text
 */
ImageTwicpics.prototype.getAlt = function () {
    if (this.imageObject === null) {
        return '';
    }

    if (this.referenceType === 'ProductVariationAttributeValue' && this.viewType === 'swatch') {
        return this.imageObject.displayValue;
    }

    if (!this.image || !this.image.alt) {
        if (this.referenceType === 'Product') {
            return this.imageObject.name;
        } else if (
            this.transformations
            && this.transformations.missingImageAlt
        ) {
            return this.transformations.missingImageAlt;
        }

        return this.imageObject.displayValue;
    }

    return this.image.alt;
};

/**
 * Gets a all images for a given image object
 * @param {dw.catalog.Product} imageObject Product or ProductVariationAttributeValue (required)
 * @param {string} imageType image type to get : catalog / content / static (required)
 * @param {string} viewType type of view (resolution) that should be generated (required)
 * @returns {Collecion} Collection of images associated with the image object and the view type
 */
ImageTwicpics.getImages = function (imageObject, imageType, viewType) {
    var TwicImgModel = require('*/cartridge/models/twicImg');
    var arrayList = new ArrayList();
    var cpt = 0;

    if (!imageObject || !imageType || !viewType) {
        return imageObject.getImages(viewType);
    }

    collections.forEach(imageObject.getImages(viewType), function (imageObj) {
        var imageTwicObj = {};
        if (!twicpicsHelpers.isTwicpicsEnabled()) {
            imageTwicObj = {
                alt: imageObj.alt,
                url: imageObj.URL.toString(),
                title: imageObj.title,
                absURL: imageObj.absURL.toString()
            };
        } else if (twicpicsHelpers.isTwicpicsEnabled() !== 'expert') {
            imageTwicObj = new ImageTwicpics(imageObject, imageType, viewType, cpt);
            imageTwicObj.expertMode = false;
        } else {
            imageTwicObj = new TwicImgModel(
                {
                    src: imageObj.url.toString(),
                    alt: imageObj.alt,
                    title: imageObj.title,
                    imageType: imageType
                }
            );
            imageTwicObj.url = imageTwicObj.urlImg;
            imageTwicObj.expertMode = true;
        }
        imageTwicObj.index = cpt;
        arrayList.push(imageTwicObj);
        cpt++;
    });

    return arrayList;
};

module.exports = ImageTwicpics;
