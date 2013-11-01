/**
 * 启动文件
 */

var http = require('http')
var path = require('path');
var express = require('express');
var ejs = require('ejs');
var rd = require('rd');
var config = require('./config');
var utils = require('./lib/utils');
var middleware = require('./lib/middleware');
var debug = require('debug')('nodewiki:app');

var app = express();

app.configure(function(){
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', ejs.__express);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookie.secret));
  app.use(app.router);
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
});

// 路由配置
// 载入控制器
rd.eachSync(__dirname + '/routes', function (f, s) {
  if (s.isFile() && f.substr(-3) === '.js') {
    debug('register routrs: %s', f);
    var m = require(f);
    if (typeof m === 'function') {
      m(app, middleware, config, utils);
    }
  }
});

// 工具函数
app.locals.utils = utils;

// 系统配置
app.locals.config = config;


http.createServer(app).listen(app.get('port'), function(){
  console.log('Server listening on port %d', app.get('port'));
});
