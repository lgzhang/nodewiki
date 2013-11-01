module.exports = function (app, middleware, config, utils) {

  var async = require('async');
  var debug = require('debug')('nodewiki:routes:view');
  var db = config.mysql;

  // ---------------------------------------------------------------------------

  // 支持的语言列表
  var acceptsLangList = ['en', 'zh'];
  var defaultLang = 'zh';

  // 查询文件内容及其翻译
  function readFile (name, callback) {
    debug('read file: %s', name);
    db.find('origin_api', {
      file:    name,
      version: config.api.version
    }, {
      tail: 'ORDER BY `id` ASC'
    }, function (err, list) {
      if (err) return callback(err);

      // 查询相应的翻译
      async.eachSeries(list, function (item, next) {

        // debug('get translate: %s, %s', name, item.hash);
        db.findOne('translate_api', {origin_hash: item.hash}, {
          tail: 'ORDER BY `vote` DESC, `timestamp` DESC'
        }, function (err, translate) {
          item.translate = translate;
          next(err);
        });

      }, function (err) {
        callback(err, list);
      });
    });
  }

  // 文件内容去掉meta部分
  function stripMetaItems (items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].type === 'meta') {
        items.splice(i, 1);
        i--;
      }
    }
    return items;
  }

  // ---------------------------------------------------------------------------

  // 默认语言文档页面
  app.get('/api/:file.:type', function (req, res, next) {
    var langs = req.header('accept-language', '').toLowerCase().split(/,|;/);
    var lang = defaultLang;
    langs.forEach(function (v1) {
      acceptsLangList.forEach(function (v2) {
        if (v1 === v2) {
          lang = v1;
        }
      });
    });
    // 跳转到指定语言页面
    res.redirect('/api/' + lang + '/' + req.params.file + '.' + req.params.type);
  });

  // 浏览指定文档页面
  app.get('/api/:lang/:file.:type', function (req, res, next) {
    res.context.setLocals('lang', req.params.lang);
    res.context.setLocals('file', req.params.file);
    res.context.setLocals('type', req.params.type);

    readFile(req.params.file, function (err, items) {
      if (err) return next(err);

      var items = stripMetaItems(items);

      res.context.setLocals('items', stripMetaItems(items));
      res.render('api/view');
    });
  });

};
