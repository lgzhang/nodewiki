/**
 * 模板函数
 *
 * 带Async的是异步函数
 */

var xss = require('xss');
var utils = require('./utils');


/**
 * 将Markdown格式的文档转换成HTML内容
 *
 * @param {String} content
 * @return {String}
 */
exports['md-to-html'] = function (content) {
  return xss(utils.markdownToHTML(content));
};
