/* eslint-disable no-undef */
'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/product/detail'));
    processInclude(require('./product/base'));
});
