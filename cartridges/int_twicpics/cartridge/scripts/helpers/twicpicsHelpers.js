'use strict';

/* global request */

var Site = require('dw/system/Site');
var File = require('dw/io/File');
var domain = Site.current.getCustomPreferenceValue('TWICHostname');

var IMAGE_TYPE = {
    CATALOG: 'CATALOG',
    SITE: 'SITE',
    CONTENT: 'CONTENT',
    STATIC: 'STATIC'
};

/**
 * Get if Twicpics is enabled in standard, advanced or expert mode
 * @returns {string} standard, advanced, expert or empty
 */
function isTwicpicsEnabled() {
    var isEnabled = Site.current.getCustomPreferenceValue('TWICEnabled');

    if (isEnabled) return isEnabled.value;

    return '';
}

/**
 * Get the Twicpics external JS link
 * @returns {string} external JS link
 */
function twicpicsExternalJS() {
    return Site.current.getCustomPreferenceValue('TWICExternalJS');
}

/**
 * Get the path of the original image
 * Find the locale into the image URL, split it and get the path after the Akamai cache
 * /on/demandware.static/-/Sites/default/dwfd0554ac/images/medium/PG.10254489.JJ3WCXX.PZ.jpg
 * give images/medium/PG.10254489.JJ3WCXX.PZ.jpg
 * @param {string} src url of the image without simplification
 * @param {string} type image type (CATALOG, STATIC, CONTENT, SITE)
 * @return {string} clean image path
 */
function getOriginalImage(src, type) {
    var locale = request.locale;
    var localeWithoutCountry = locale.split('_')[0];
    var split = '';

    if (src.indexOf(File.SEPARATOR + locale + File.SEPARATOR) !== -1) {
        split = File.SEPARATOR + locale + File.SEPARATOR;
    } else if (src.indexOf(File.SEPARATOR + localeWithoutCountry + File.SEPARATOR) !== -1) {
        split = File.SEPARATOR + localeWithoutCountry + File.SEPARATOR;
        locale = localeWithoutCountry;
    } else if (src.indexOf('/default/') !== -1) {
        split = '/default/';
        locale = 'default';
    } else {
        return '';
    }

    var splitImage = src.split(split)[1].split(File.SEPARATOR);

    splitImage.shift();

    if (type !== IMAGE_TYPE.CATALOG) {
        splitImage.unshift(locale);
    }

    return splitImage.join(File.SEPARATOR);
}


/**
 * Get the Twicpics catalog path
 * @param {string} src original image url
 * @returns {string} catalog path
 */
function getCatalogPath(src) {
    var catalogsPath = Site.current.getCustomPreferenceValue('TWICCatalogPath');
    var catalogPath = null;

    if (!catalogsPath || catalogsPath.length === 0) throw new Error('The field TWICCatalogPath is empty');

    catalogsPath.forEach(function (catalog) {
        if (src.indexOf(catalog) !== -1) {
            catalogPath = catalog;
        }
    });

    return catalogPath;
}

/**
 * Get the Twicpics content path
 * @returns {string} content path
 */
function getContentPath() {
    var contentPath = Site.current.getCustomPreferenceValue('TWICContentPath');

    if (!contentPath) throw new Error('The field TWICContentPath is empty');

    return contentPath;
}

/**
 * Get the Twicpics static path
 * @returns {string} static path
 */
function getStaticPath() {
    var staticPath = Site.current.getCustomPreferenceValue('TWICStaticPath');

    if (!staticPath) throw new Error('The field TWICStaticPath is empty');

    return staticPath;
}

/**
 * Get the Twicpics static path
 * @returns {string} static path
 */
function getSitePath() {
    var sitePath = Site.current.getCustomPreferenceValue('TWICSitePath');

    if (!sitePath) throw new Error('The field TWICSitePath is empty');

    return sitePath;
}

/**
 * Get Image Path
 * @param {string} imageType image type (CONTENT/SITE/STATIC/CATALOG)
 * @param {string} src original image url
 * @returns {string} image path
 */
function getImagePath(imageType, src) {
    var path;

    switch (imageType) {
        case IMAGE_TYPE.SITE :
            path = getSitePath();
            break;
        case IMAGE_TYPE.CONTENT :
            path = getContentPath();
            break;
        case IMAGE_TYPE.STATIC :
            path = getStaticPath();
            break;
        case IMAGE_TYPE.CATALOG :
            path = getCatalogPath(src);
            break;
        default : path = '';
    }

    return path;
}

/**
 * Set an URL string on the Twicpics format
 * Example : /on/demandware.static/-/Sites/default/dwfd0554ac/images/medium/PG.10254489.JJ3WCXX.PZ.jpg
 * gives https://[host]/catalogs/images/medium/PG.10254489.JJ3WCXX.PZ.jpg
 * @param {string} src original image url
 * @param {string} imageType image type (CONTENT/SITE/STATIC/CATALOG)
 * @returns {string} Twicpics URL
 */
function getTwicpicsImageUrl(src, imageType) {
    if (!domain) throw new Error('The field TWICHostname is empty');

    if (src.includes(domain)) { return src; }

    var imagePath = getImagePath(imageType, src);
    var originalImage = getOriginalImage(src, imageType);

    return [domain, imagePath, originalImage].join(File.SEPARATOR);
}


/**
 * getTwicSrcImage gets the content of tag data-twic-src
 * Example: catalogs/images/medium/90011212_001_0.jpg
 * @param {string} src inital image src
 * @returns {string} src complients with tag data-twic-src
 */
function getTwicSrcImage(src) {
    if (!domain) throw new Error('The field TWICHostname is empty');
    return src.replace(domain, '');
}

module.exports = {
    isTwicpicsEnabled: isTwicpicsEnabled,
    twicpicsExternalJS: twicpicsExternalJS,
    getOriginalImage: getOriginalImage,
    getTwicpicsImageUrl: getTwicpicsImageUrl,
    getTwicSrcImage: getTwicSrcImage,
    domain: domain,
    IMAGE_TYPE: IMAGE_TYPE
};
