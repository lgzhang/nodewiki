var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var async = require('async');
var marked = require('marked');
var config = require('../config');
var db = config.mysql;
var utils = module.exports;


/**
 * 32位MD5加密
 *
 * @param {string} text 文本
 * @return {string}
 */
exports.md5 = function (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

/**
 * 加密密码
 *
 * @param {string} password
 * @return {string}
 */
exports.encryptPassword = function (password) {
  var random = utils.md5(Math.random() + '' + Math.random()).toUpperCase();
  var left = random.substr(0, 2);
  var right = random.substr(-2);
  var newpassword = utils.md5(left + password + right).toUpperCase();
  return [left, newpassword, right].join(':');
};

/**
 * 验证密码
 *
 * @param {string} password 待验证的密码
 * @param {string} encrypted 密码加密字符串
 * @return {bool}
 */
exports.validatePassword = function (password, encrypted) {
  var random = encrypted.toUpperCase().split(':');
  if (random.length < 3) return false;
  var left = random[0];
  var right = random[2];
  var main = random[1];
  var newpassword = utils.md5(left + password + right).toUpperCase();
  return newpassword === main;
};

/**
 * 加密信息
 *
 * @param {Mixed} data
 * @param {String} secret
 * @return {String}
 */
exports.encryptData = function (data, secret) {
  var str = JSON.stringify(data);
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
};

/**
 * 解密信息
 *
 * @param {String} str
 * @param {String} secret
 * @return {Mixed}
 */
exports.decryptData = function (str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  var data = JSON.parse(dec);
  return data;
};

/**
 * 产生随机字符串
 *
 * @param {Integer} size
 * @return {String}
 */
exports.randomString = function (size) {
  size = size || 6;
  var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var max_num = code_string.length + 1;
  var new_pass = '';
  while (size > 0) {
    new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
    size--;
  }
  return new_pass;
};

/**
 * 将Markdown转换为HTML
 *
 * @param {String} content
 * @return {String}
 */
exports.markdownToHTML = function (content) {
  return marked(content);
};
