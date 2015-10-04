var margin = {top: 30, right: 20, bottom: 30, left: 50};
var width = 1024 - margin.left - margin.right;
var height = 768 - margin.top - margin.bottom;
var transition_length = 2000;
var max_radius = 10;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var t = d3.scale.linear().range([0, transition_length]);
var color = d3.scale.category20();

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var gAxis = svg.append("g")
  .attr("id", "gAxis")
  .attr("transform", "translate(0," + height + ")");

var meanLine = svg.append("line").attr("id", "meanLine");

d3.select("#runButton").on("click", function() {
  var elementsCount = d3.select("#elementsCount").property("valueAsNumber");
  var data = d3.range(elementsCount).map(function() { return {x: Math.random(), y: Math.random()}; });

  var lowerValuesCount = {};
  data.forEach(function(d) {
    var that = d;
    var lowerValues = data.reduce(function(reduce, d) {
      return reduce + ((y(d.y) > y(that.y) && Math.abs(x(d.x) - x(that.x)) <= max_radius * 2)? 1 : 0);
    }, 0);
    d.lowerValues = lowerValues;
  })

  x.domain([0, d3.max(data, function(d) { return d.x})]);
  gAxis.transition().duration(transition_length).call(xAxis);

  var mean = d3.mean(data, function(d) { return d.x; });
  meanLine.attr("y1", 0).attr("y2", height);
  meanLine.transition().duration(transition_length).attr("x1", x(mean)).attr("x2", x(mean));

  var circles = svg.selectAll("circle").data(data);
  circles.enter().append("circle");

  circles
    .attr("r", 1)
    .attr("cx", function(d) { return x(d.x)})
    .attr("cy", function(d) { return y(d.y)})
    .style("fill", function(d) { return color(d.lowerValues); })
    .transition()
      .duration(function(d) { return t(d.y)})
      .ease("exp")
      .attr("r", max_radius)
      .attr("cy", function(d) { return height - d.lowerValues * max_radius * 2 - max_radius; });

  circles.exit().remove();
});
