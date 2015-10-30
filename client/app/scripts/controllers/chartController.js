var max_history = 20;
var step = 1;
var graph_update_speed = 1000;
var lineChartData ;

var randomScalingFactor = function(){
  return Math.round(Math.random()*100)
};

function GetTime(){
   return moment().format('HH:mm:ss');
}

var init_chart = function(){
  var chart_data = Array();
  var chart_labels = Array();
  for(index = 0;index<max_history;index++){
    chart_data.push(0);
    chart_labels.push("");
  }

  lineChartData = {
  labels : chart_labels,
  datasets : [
      {
        label: "My First dataset",
        fillColor : "rgba(00,200,00,0.3)",
        strokeColor : "rgba(220,220,220,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(220,220,220,1)",
        data : chart_data
      }
    ]
  };
}
var update_chart = function(){
  myLineChart.removeData();
  myLineChart.addData([randomScalingFactor()],GetTime())
  myLineChart.update();
}
var ctx = document.getElementById("canvas").getContext("2d");
var myLineChart = new Chart(ctx).Line(lineChartData, {
responsive: true
});
setInterval(update_chart,graph_update_speed);
