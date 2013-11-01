/**
 * 启动文件
 */

var http = require('http')
var path = require('path');
var express = require('express');
var rd = require('rd');
var expressLiquid = require('express-liquid');
var config = require('./config');
var utils = require('./lib/utils');
var filters = require('./lib/filters');
var middleware = require('./lib/middleware');
var debug = require('debug')('nodewiki:app');


// 模板引擎配置
var baseContext = expressLiquid.newContext();
// 系统配置
baseContext.setLocals('config', config);
// 模板函数配置
for (var i in filters) {
  if (i.substr(-5) === 'Async') {
    baseContext.setAsyncFilter(i.substr(0, i.length - 5), filters[i]);
  } else {
    baseContext.setFilter(i, filters[i]);
  }
}


// express配置
var app = express();
app.configure(function(){
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', expressLiquid({
    context: baseContext
  }));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookie.secret));
  app.use(function (req, res, next) {
    res.context = expressLiquid.newContext();
    res._render = res.render;
    res.render = function (tpl) {
      res._render(tpl, {context: res.context});
    };
    next();
  });
  app.use(app.router);
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
});

// 路由配置
rd.eachSync(__dirname + '/routes', function (f, s) {
  if (s.isFile() && f.substr(-3) === '.js') {
    debug('register routrs: %s', f);
    var m = require(f);
    if (typeof m === 'function') {
      m(app, middleware, config, utils);
    }
  }
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Server listening on port %d', app.get('port'));
});
