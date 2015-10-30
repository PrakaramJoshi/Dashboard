// print process.argv

var program = require('commander');
var chalk = require ('chalk');
var prompt = require('prompt');
var socket = require('socket.io-client')('http://localhost:8080');

prompt.start();
var url= '';
var msg= '';
var header= '';
var event_type='';

function log(obj){
  console.log(obj);
}
function empty(data)
{
  return data==''
}
function get_val(default_val,usertyped){
  if(empty(usertyped))
      return default_val;
  return usertyped;
}
program
  .version('0.0.1')
  .option('-u, --url <>' , 'Set the host url', 'http://localhost')
  .option('-m, --msg <>', 'Set message to be sent','Hello world')
  .option('-h, --header <>', 'Set header','Content-type : application/json')
  .option('-e, --event_type <>', 'Set event','data')
  .parse(process.argv);

var get_details = function(cb){

  prompt.get(['url', 'msg', 'header','event_type'], function (err, result) {

    url = get_val(program.url,result.url);
    msg = get_val(program.msg,result.msg);
    event_type = get_val(program.event_type,result.event_type);
    header = get_val(program.header,result.header);
    cb();
    setTimeout(function(){
      get_details(cb)},0);
  });

}

var print_details = function(){
  log(chalk.green.bold('parameter:\t')+chalk.red.bold("value"));
  log(chalk.green("    url   \t")+chalk.red(url));
  log(chalk.green("    msg   \t")+chalk.red(msg));
  log(chalk.green("   header \t")+chalk.red(header));
  log(chalk.green("event_type\t")+chalk.red(event_type));
}

var emit_msg = function(){
  socket.emit(event_type,msg);
}

var print_and_emit = function(){
  print_details();
  emit_msg();
}

socket.on('data',function(data){
  console.log('\nrecieved data : '+data);
});

get_details(print_and_emit);
