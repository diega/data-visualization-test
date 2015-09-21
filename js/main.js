var margin = {top: 30, right: 20, bottom: 30, left: 50};
var width = 1024 - margin.left - margin.right;
var height = 768 - margin.top - margin.bottom;
var transition_length = 2000;
var max_radius = 10;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var t = d3.scale.linear().range([0, transition_length]);

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
    .transition()
      .duration(function(d) { return t(d.y)})
      .ease("bounce")
      .attr("r", max_radius)
      .attrTween("cy", function(d, i, a) {
        var currentCircle = d3.select(this);
        return function(t) {
          var r0 = currentCircle.attr("r");
          var x0 = currentCircle.attr("cx");
          var y0 = currentCircle.attr("cy");
          circles
            .sort(function(a, b) { return d3.ascending(a.y, b.y) })
            .each(function(d, i) {
              var otherCircle = d3.select(this);
              var r1 = otherCircle.attr("r");
              var x1 = otherCircle.attr("cx");
              var y1 = otherCircle.attr("cy");

              if (!(x0 == x1 && y0 == y1 && r0 == r1)) {
                var centerDistanceSqrt = Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2);
                if ((Math.pow(r0-r1, 2) <=  centerDistanceSqrt) && (centerDistanceSqrt <= Math.pow(r0+r1, 2))) {
                  console.log("colisiona");
                  //currentCircle.interrupt();
                }
              }
            });
          var heightInterpolator = d3.interpolate(a, height - max_radius);
          return heightInterpolator(t);
        }
      });

  circles.exit().remove();
});
