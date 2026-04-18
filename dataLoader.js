const DataLoader = (function() {
  const defaultConfig = {
    dataUrl: "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json",
    dateFormat: "%Y-%m-%d"
  };

  function loadData(config = {}) {
    const mergedConfig = { ...defaultConfig, ...config };
    
    return new Promise((resolve, reject) => {
      d3.json(mergedConfig.dataUrl)
        .then(data => {
          const parsedData = parseData(data, mergedConfig);
          resolve(parsedData);
        })
        .catch(error => {
          reject(new Error(`Failed to load data: ${error.message}`));
        });
    });
  }

  function parseData(rawData, config) {
    const parseDate = d3.timeParse(config.dateFormat);
    
    return {
      raw: rawData,
      dataset: rawData.data,
      parseDate: parseDate,
      getDates: function() {
        return this.dataset.map(d => parseDate(d[0]));
      },
      getGDPValues: function() {
        return this.dataset.map(d => d[1]);
      },
      getMinDate: function() {
        return d3.min(this.dataset, d => parseDate(d[0]));
      },
      getMaxDate: function() {
        return d3.max(this.dataset, d => parseDate(d[0]));
      },
      getMaxGDP: function() {
        return d3.max(this.dataset, d => d[1]);
      }
    };
  }

  return {
    loadData: loadData,
    parseData: parseData
  };
})();
