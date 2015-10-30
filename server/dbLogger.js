(function() {
    var mongoose = require ("mongoose");
    var logger = require('./logger')
    // Here we find an appropriate database to connect to, defaulting to
    // localhost if we don't find one.
    var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/toolLogs';

    // Makes connection asynchronously.  Mongoose will queue up database
      // operations and release them when the connection is complete.
    mongoose.connect(uristring, function (err, res) {
      if (err) {
        logger.errlog ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
        logger.statlog ('Succeeded connected to: ' + uristring);
      }
    });

    var sessionSchema = new mongoose.Schema({
      tool      : String,
      version   : String,
      platform  : String,
      user      : String,
      starttime : String,
      address   : String,
      id        : String
    });

    var logSchema = new mongoose.Schema({
      id        : String,
      log       : String
    });

    var session = mongoose.model('ToolSession', sessionSchema);

    var log = mongoose.model('ToolLog', logSchema);

    module.exports.add_session_to_database = function(data){
      var sessionData = new session ({
        tool      : data.tool_name,
        version   : data.tool_version,
        platform  : data.tool_platform,
        user      : data.tool_username,
        starttime : data.tool_starttime,
        address   : data.client_address,
        id        : data.session_id
      });
      // Saving it to the database.
      sessionData.save(function (err) {if (err) logger.errlog ('Error on save!')});
    }

    module.exports.add_log_to_database = function(data){
      var logData = new log ({
        id        : data.session_id,
        log       : data.msg
      });

      // Saving it to the database.
      logData.save(function (err) {if (err) logger.errlog ('Error on save!')});
    }

}());
