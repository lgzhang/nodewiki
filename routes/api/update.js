module.exports = function (app, middleware, config, utils) {

  var async = require('async');
  var debug = require('debug')('nodewiki:routes:update');
  var db = config.mysql;

  // ---------------------------------------------------------------------------



  // ---------------------------------------------------------------------------

  app.post('/translate/vote', middleware.checkSignin, function (req, res, next) {
    var id = req.body.id;
    if (!(id > 0)) return res.json({error: 'id参数有误'});

    var user_id = req.signinUser.id;
    db.findOne('translate_vote_history', {translate_id: id, user_id: user_id}, function (err, vote) {
      if (err) return res.json({error: err.toString()});
      if (vote) return res.json({success: 0});

      db.insert('translate_vote_history', {
        translate_id: id,
        user_id:      user_id,
        timestamp:    db.timestamp()
      }, function (err, ret) {
        if (err) return res.json({error: err.toString()});

        var sql = 'UPDATE `translate_api` SET `vote`=`vote`+1 WHERE `id`=' + db.escape(id);
        db.query(sql, function (err, ret) {
          if (err) return res.json({error: err.toString()});

          res.json({success: ret.affectedRows});
        });
      });
    });
  });

};
