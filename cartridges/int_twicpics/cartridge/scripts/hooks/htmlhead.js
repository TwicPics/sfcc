'use strict';

var ISML = require('dw/template/ISML');

var twicpicsHelpers = require('*/cartridge/scripts/helpers/twicpicsHelpers');

/**
 * custom hook SFRA
 */
function htmlHead() {
    if (
        twicpicsHelpers.isTwicpicsEnabled() !== 'advanced'
        && twicpicsHelpers.isTwicpicsEnabled() !== 'expert'
    ) {
        return;
    }

    var externalJS = twicpicsHelpers.twicpicsExternalJS();

    ISML.renderTemplate('components/header/twicpicsHeader', {
        externalJS: externalJS
    });
}

module.exports = {
    htmlHead: htmlHead
};
