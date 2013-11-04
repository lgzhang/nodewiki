/**
 * 中间件
 */

var utils = require('./utils');
var config = require('../config');
var debug = require('debug')('nodewiki:middleware');


// 检查用户是否已登录
exports.checkSignin = function (req, res, next) {

  if (!req.cookies.signin) {
    return res.redirect('/signin?url=' + req.url);
  }

  var data = utils.decryptData(req.cookies.signin, config.signin.secret);
  if (data && data.id) {
    req.signinUser = {
      id:       data.id,
      nickname: data.n
    };
    next();
  } else {
    res.redirect('/signin?url=' + req.url);
  }

};