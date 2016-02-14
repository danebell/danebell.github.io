var margin = {top: 20, right: 20, bottom: 0, left: 50},
    width = 300 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years,10);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.prevalence); });

var svg = d3.select("span#obesitygraph")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg")
    // //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin slice")
    .attr("viewBox", "0 0 400 300")
    .classed("svg-content-responsive", true)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("us_obesity_trend.tsv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var bmis = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, prevalence: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(bmis, function(c) { return d3.min(c.values, function(v) { return v.prevalence; }); }),
    d3.max(bmis, function(c) { return d3.max(c.values, function(v) { return v.prevalence; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      //.attr("transform", "rotate(-90)")
      //.attr("y", 8)
      .attr("x", -40)
      .attr("dy", 50)
      .style("text-anchor", "end")
      .text("%");

  var bmi = svg.selectAll(".bmi")
      .data(bmis)
    .enter().append("g")
      .attr("class", "bmi");

  bmi.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  bmi.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.prevalence) + ")"; })
      .attr("x", "-3em")
      .attr("dy", "-0.5em")
      .text(function(d) { return d.name; });
});