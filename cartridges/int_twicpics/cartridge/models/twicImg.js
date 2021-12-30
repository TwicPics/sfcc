'use strict';


var Logger = require('dw/system/Logger').getLogger('Twicpics', 'Twicpics');
var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');
var URLUtils = require('dw/web/URLUtils');

/**
 * Model TwicImg
 * @param {Object} args arguments to create Twicpics Image object
 */
function TwicImg(args) {
    try {
        this.src = this.initSrc(args.src);
        this.imageType = this.initImageType(args.imageType);
        this.alt = this.initAlt(args.alt);
        this.width = this.initWidth(args.width);
        this.height = this.initHeight(args.height);
        this.placeholder = this.initPlaceholder(args.placeholder);
        this.ratio = this.initRatio(args.ratio);
        this.step = this.initStep(args.step);
        this.focus = this.initFocus(args.focus);
        this.transition = this.initTransition(args.transition);
        this.class = this.initClass(args.class);
        this.title = this.initTitle(args.title);
        this.itemprop = this.initItemprop(args.itemprop);
        this.dataIndex = this.initDataIndex(args.dataIndex);
        this.transitionDelay = this.initTransitionDelay(args.transitionDelay);
        this.transitionDuration = this.initTransitionDuration(args.transitionDuration);
        this.transitionTimingFunction = this.initTransitionTimingFunction(args.transitionTimingFunction);
        this.style = this.initStyle(args.style);
        this.first = this.initFirst(args.first);
        this.last = this.initLast(args.last);
        this.urlImg = this.urlImg();
        this.apiRatio = this.apiRatio();
        this.apiOutput = this.apiOutput();
        this.apiFocus = this.focus;
        this.twicStep = this.step;
        this.twicFocus = this.focus;
        this.twicSrc = this.initTwicSrc();
        this.imgStyle = this.imgStyle();
        this.paddingRatio = this.paddingRatio();
        this.bgStyle = this.bgStyle();
    } catch (e) {
        this.src = URLUtils.staticURL('images/noimagelarge.png').toString();

        Logger.error('An error occured on the Twicpics cartridge : {0}', e.message);
    }
}

TwicImg.prototype.initSrc = function (src) {
    if (!src || typeof src !== 'string') {
        Logger.error('Wrong \'src\' format. \'src\' is required and must contain an absolute or relative path to an image.');
        throw new Error('Wrong \'src\' format. \'src\' is required and must contain an absolute or relative path to an image.');
    }
    return src;
};

TwicImg.prototype.initImageType = function (type) {
    if (!type || typeof type !== 'string' || [twicpicsHelpers.IMAGE_TYPE.SITE, twicpicsHelpers.IMAGE_TYPE.STATIC, twicpicsHelpers.IMAGE_TYPE.CONTENT, twicpicsHelpers.IMAGE_TYPE.CATALOG].includes(type)) {
        Logger.error('Wrong image type, it must be SITE, STATIC, CONTENT or CATALOG');
    }
    return type;
};

TwicImg.prototype.initAlt = function (alt) {
    return typeof alt === 'string' ? alt : undefined;
};

TwicImg.prototype.initPlaceholder = function (placeholder) {
    return ['preview', 'meancolor', 'maincolor', 'none'].includes(placeholder) ? placeholder : 'preview';
};

TwicImg.prototype.initWidth = function (width) {
    return (typeof width === 'string' || typeof width === Number) && /\d+/.test(width) ? width : undefined;
};

TwicImg.prototype.initHeight = function (height) {
    return (typeof height === 'string' || typeof height === Number) && /\d+/.test(height) ? height : undefined;
};

TwicImg.prototype.initRatio = function (ratio) {
    return typeof ratio === 'string' && /\d+\/\d+/.test(ratio) ? ratio : undefined;
};

TwicImg.prototype.initFocus = function (focus) {
    return typeof focus === 'string' ? focus : undefined;
};

TwicImg.prototype.initStep = function (step) {
    return (typeof step === 'string' || typeof step === Number) && /\d+/.test(step) ? step : undefined;
};

TwicImg.prototype.initTransition = function (transition) {
    return typeof transition === Boolean ? transition : true;
};

TwicImg.prototype.initTransitionDuration = function (transitionDuration) {
    return typeof transitionDuration === 'string' ? transitionDuration : '400ms';
};

TwicImg.prototype.initTransitionTimingFunction = function (transitionTimingFunction) {
    return typeof transitionTimingFunction === 'string' ? transitionTimingFunction : 'ease';
};

TwicImg.prototype.initTransitionDelay = function (transitionDelay) {
    return typeof transitionDelay === 'string' ? transitionDelay : '0ms';
};

TwicImg.prototype.initClass = function (argClass) {
    return typeof argClass === 'string' ? argClass : '';
};

TwicImg.prototype.initTitle = function (title) {
    return typeof title === 'string' ? title : undefined;
};

TwicImg.prototype.initItemprop = function (itemprop) {
    return typeof itemprop === 'string' ? itemprop : undefined;
};

TwicImg.prototype.initDataIndex = function (dataIndex) {
    return typeof dataIndex === 'string' ? dataIndex : undefined;
};

TwicImg.prototype.initStyle = function (style) {
    return typeof style === 'string' ? style : undefined;
};

TwicImg.prototype.initTwicSrc = function () {
    return 'image:' + twicpicsHelpers.getTwicSrcImage(this.urlImg);
};

TwicImg.prototype.initFirst = function (first) {
    return first === 'true';
};

TwicImg.prototype.initLast = function (last) {
    return last === 'true';
};

TwicImg.prototype.apiRatio = function () {
    if (this.ratio) {
        // Use `ratio` if provided.
        return this.ratio.replace('/', ':');
    } else if (this.width && this.height) {
        // Use 'width' and 'height' if no 'ratio'.
        return this.width + ':' + this.height;
    }
    // Fallback to square.
    return '1:1';
};

TwicImg.prototype.apiOutput = function () {
    return (this.placeholder !== 'none') ? this.placeholder : false;
};

TwicImg.prototype.paddingRatio = function () {
    var r = [];
    if (this.ratio) {
        r = this.ratio.split('/');
    } else {
        r.push(this.width || 1);
        r.push(this.height || 1);
    }
    return Number.parseFloat((r[1] / r[0]) * 100).toFixed(2);
};

TwicImg.prototype.urlImg = function () {
    return twicpicsHelpers.getTwicpicsImageUrl(this.src, this.imageType);
};

TwicImg.prototype.bgStyle = function () {
    var styles = '';
    if (this.paddingRatio) {
        styles += 'padding-top: ' + this.paddingRatio.toString() + '%;';
    }
    // Only provide a background image if the user asks for a placeholder.
    if (this.apiOutput) {
        var params = [];
        if (this.apiFocus) { params.push({ k: 'focus', v: this.apiFocus }); }
        if (this.apiRatio) { params.push({ k: 'cover', v: this.apiRatio }); }
        if (this.apiOutput) { params.push({ k: 'output', v: this.apiOutput }); }
        var apiParams = '';
        var slash = false;
        params.forEach(function (element) {
            if (slash) { apiParams += '/'; }
            apiParams += element.k + '=' + element.v;
            slash = true;
        });
        styles += ' background-image: url(' + this.urlImg + '?twic=v1/' + apiParams + ');';
    }
    return styles;
};

TwicImg.prototype.imgStyle = function () {
    if (this.transition) {
        var imgStyle = 'transition-duration: ' + this.transitionDuration + '; transition-timing-function: ' + this.transitionTimingFunction + '; transition-delay: ' + this.transitionDelay + ';';
        return this.style ? imgStyle + ' ' + this.style + ';' : imgStyle;
    }
    return undefined;
};

module.exports = TwicImg;
