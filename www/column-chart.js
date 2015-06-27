function columnChart() {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 420,
      height = 500,
      xRoundBands = 0.1,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      zValue = function(d) { return d[2]; },
      xScale = d3.scale.ordinal(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale);
      
 
  function chart(selection) {
    selection.each(function(data) {
 
      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i), zValue.call(data, d, i)];
      });
      console.log(data)
    
      // Update the x-scale.
      xScale
        .domain(data.map(function(d) { return d[0];} ))
        .rangeRoundBands([0, width - margin.left - margin.right], xRoundBands);
 
      // Update the y-scale.
      yScale
        .domain(d3.extent(data.map(function(d) { return d[1];} )))
        .range([height - margin.top - margin.bottom, 0])
        .nice();
 
      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);
 
      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "scrubber");
      gEnter.append("g").attr("class", "bars");
      gEnter.append("g").attr("class", "hotspots");
      gEnter.append("g").attr("class", "x axis zero");
 
      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);
 
      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var scrub = svg.select(".scrubber").append("rect")
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", xScale.rangeBand())
        .attr("y", 0)
        .attr("x", 0)
        .attr("class", "scrub")
        .style("opacity", 0);
 
     // Update the bars.
      var bar = svg.select(".bars").selectAll(".bar").data(data);
      bar.enter().append("rect");
      bar.exit().remove();
      bar .attr("class", function(d, i) { return d[1] < 0 ? "bar negative" : "bar positive"; })
          .attr("x", function(d) { return X(d); })
          .attr("y", function(d, i) { return d[1] < 0 ? Y0() : Y(d); })
          .attr("width", xScale.rangeBand())
          .attr("height", function(d, i) { return Math.max(Math.abs( Y(d) - Y0() ), 5); })
          .style("opacity", function(d, i) { return d[2] == 0 ? 0.1 : 1 });

      // Update the scrubbers.
      var hotspot = svg.selectAll(".hotspot").data(data, function (d,i) {
        return d[0];
      });
      hotspot.enter().append("rect");
      hotspot.exit().remove();
      hotspot.attr("class", "hotspot")
        .attr("x", function(d) { return X(d); })
        .attr("y", 0)
        .attr("width", xScale.rangeBand())
        .attr("height", height - margin.top - margin.bottom)
        .on("mouseover", function(d) {      
          scrub.attr("transform", "translate(" + d3.select(this).attr("x") + ", 0)")     
            .style("opacity", .9);   
          })                  
        .on("mouseout", function(d) {       
          scrub.style("opacity", 0);   
        });
    
    // zero line
     g.select(".x.axis.zero")
        .attr("transform", "translate(0," + Y0() + ")")
        .call(xAxis.tickFormat("").tickSize(0));
    });
  }
 
 
// The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }
 
  function Y0() {
    return yScale(0);
  }
 
  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }
 
  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };
 
  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };
 
  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
 
  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };
 
  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };
 
  return chart;
}