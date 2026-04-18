const ChartRenderer = (function() {
  const defaultConfig = {
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 100, left: 50 },
    barColor: "#337ab7",
    barHoverColor: "#23527c",
    xAxisTickInterval: 1,
    tooltipBackgroundColor: "rgba(0, 0, 0, 0.8)",
    tooltipTextColor: "white"
  };

  function renderChart(containerId, data, config = {}) {
    const mergedConfig = { ...defaultConfig, ...config };
    const { width, height, margin } = mergedConfig;
    
    const svg = d3.select(containerId)
      .attr("width", width)
      .attr("height", height);

    const xScale = createXScale(data, mergedConfig);
    const yScale = createYScale(data, mergedConfig);

    createXAxis(svg, xScale, mergedConfig);
    createYAxis(svg, yScale, mergedConfig);
    createBars(svg, data, xScale, yScale, mergedConfig);
    setupTooltip(mergedConfig);

    return {
      svg: svg,
      xScale: xScale,
      yScale: yScale,
      config: mergedConfig
    };
  }

  function createXScale(data, config) {
    const { width, margin } = config;
    
    return d3.scaleTime()
      .domain([data.getMinDate(), data.getMaxDate()])
      .range([margin.left, width - margin.right]);
  }

  function createYScale(data, config) {
    const { height, margin } = config;
    
    return d3.scaleLinear()
      .domain([0, data.getMaxGDP()])
      .nice()
      .range([height - margin.bottom, margin.top]);
  }

  function createXAxis(svg, xScale, config) {
    const { height, margin, xAxisTickInterval } = config;
    
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(xAxisTickInterval));

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);
  }

  function createYAxis(svg, yScale, config) {
    const { margin } = config;
    
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);
  }

  function createBars(svg, data, xScale, yScale, config) {
    const { width, margin, barColor, barHoverColor } = config;
    const bars = svg.selectAll(".bar")
      .data(data.dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("data-date", d => d[0])
      .attr("data-gdp", d => d[1])
      .attr("x", d => xScale(data.parseDate(d[0])))
      .attr("y", d => yScale(d[1]))
      .attr("width", (width - margin.left - margin.right) / data.dataset.length - 1)
      .attr("height", d => config.height - margin.bottom - yScale(d[1]))
      .attr("index", (d, i) => i)
      .style("fill", barColor)
      .style("cursor", "pointer");

    bars.on("mouseover", function(event, d) {
      d3.select(this).style("fill", barHoverColor);
      showTooltip(event, d);
    });

    bars.on("mouseout", function() {
      d3.select(this).style("fill", barColor);
      hideTooltip();
    });

    return bars;
  }

  function setupTooltip(config) {
    const tooltip = d3.select("#tooltip");
    
    tooltip
      .style("background-color", config.tooltipBackgroundColor)
      .style("color", config.tooltipTextColor);
  }

  function showTooltip(event, d) {
    const tooltip = d3.select("#tooltip");
    const [x, y] = d3.pointer(event);
    
    tooltip.style("visibility", "visible")
      .attr("data-date", d[0])
      .style("left", `${x + 20}px`)
      .style("top", `${y - 30}px`)
      .html(`<strong>Date:</strong> ${d[0]}<br><strong>GDP:</strong> $${d[1].toFixed(1)} Billion`);
  }

  function hideTooltip() {
    const tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
  }

  function updateChart(chartInstance, newConfig) {
    const { svg, config: oldConfig } = chartInstance;
    const mergedConfig = { ...oldConfig, ...newConfig };
    
    svg.selectAll("*").remove();
    
    return renderChart("#chart", chartInstance.data, mergedConfig);
  }

  return {
    renderChart: renderChart,
    updateChart: updateChart
  };
})();
