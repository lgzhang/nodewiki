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
exports.md_to_html = function (content) {
  return xss(utils.markdownToHTML(content));
};

/**
 * 将内容转换成 #id
 *
 * @param {String} content
 * @return {String}
 */
exports.content_to_id = function (content) {
  if (idCache.hasOwnProperty(content)) return idCache[content];

  text = content.toLowerCase();
  text = text.replace(/[^a-z0-9]+/g, '_');
  text = text.replace(/^_+|_+$/, '');
  text = text.replace(/^([^a-z])/, '_$1');

  if (idCounters.hasOwnProperty(text)) {
    text += '_' + (++idCounters[text]);
  } else {
    idCounters[text] = 0;
  }
  idCache[content] = text;
  return text;
};
var idCounters = {};
var idCache = {};