(function() {
  var chalk = require('chalk');
  var moment = require('moment');

   function getDateTime() {
      return moment().format('MMMM Do YYYY, h:mm:ss:a');
  }
  var chalked_log = function(chalk_type,msg){
    console.log(chalk_type(getDateTime())+"\t"+chalk_type(msg));
  }
  module.exports.olog = function (msg){
    chalked_log(chalk.green,"\u02C4 "+msg);
  }
  module.exports.ilog = function(msg){
    chalked_log(chalk.blue,"\u02C5 "+msg);
  }

  module.exports.statlog= function(msg){
    chalked_log(chalk.gray,"STATUS:\t"+msg);
  }

  module.exports.errlog = function(msg){
    chalked_log(chalk.red,"ERROR:\t"+msg);
  }

}());
