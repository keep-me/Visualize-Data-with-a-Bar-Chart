const BarChartApp = (function() {
  let chartInstance = null;
  let currentData = null;
  let currentConfig = null;

  function init(userConfig = {}) {
    currentConfig = ChartConfig.createConfig(userConfig);
    
    const dataLoaderConfig = ChartConfig.getDataLoaderConfig(currentConfig);
    const chartRendererConfig = ChartConfig.getChartRendererConfig(currentConfig);

    DataLoader.loadData(dataLoaderConfig)
      .then(data => {
        currentData = data;
        chartInstance = ChartRenderer.renderChart("#chart", data, chartRendererConfig);
        chartInstance.data = data;
        console.log("Bar chart initialized successfully");
      })
      .catch(error => {
        console.error("Failed to initialize bar chart:", error);
      });
  }

  function updateConfig(newConfig) {
    if (!chartInstance) {
      console.warn("Chart not initialized. Call init() first.");
      return;
    }

    currentConfig = ChartConfig.mergeConfig({ ...currentConfig, ...newConfig });
    const chartRendererConfig = ChartConfig.getChartRendererConfig(currentConfig);
    
    chartInstance = ChartRenderer.updateChart(chartInstance, chartRendererConfig);
    chartInstance.data = currentData;
    console.log("Chart configuration updated");
  }

  function getCurrentConfig() {
    return JSON.parse(JSON.stringify(currentConfig));
  }

  function getDefaultConfig() {
    return ChartConfig.getDefaultConfig();
  }

  return {
    init: init,
    updateConfig: updateConfig,
    getCurrentConfig: getCurrentConfig,
    getDefaultConfig: getDefaultConfig
  };
})();

document.addEventListener("DOMContentLoaded", function() {
  const userConfig = {
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 100, left: 50 },
    barColor: "#337ab7",
    barHoverColor: "#23527c"
  };
  
  BarChartApp.init(userConfig);
  
  window.BarChartApp = BarChartApp;
});
