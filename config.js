const ChartConfig = (function() {
  const defaultConfig = {
    dataUrl: "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json",
    dateFormat: "%Y-%m-%d",
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 100, left: 50 },
    barColor: "#337ab7",
    barHoverColor: "#23527c",
    xAxisTickInterval: 1,
    tooltipBackgroundColor: "rgba(0, 0, 0, 0.8)",
    tooltipTextColor: "white"
  };

  const configValidators = {
    dataUrl: (value) => typeof value === "string" && value.length > 0,
    dateFormat: (value) => typeof value === "string",
    width: (value) => typeof value === "number" && value > 0,
    height: (value) => typeof value === "number" && value > 0,
    margin: (value) => {
      if (typeof value !== "object" || value === null) return false;
      const requiredKeys = ["top", "right", "bottom", "left"];
      return requiredKeys.every(key => 
        typeof value[key] === "number" && value[key] >= 0
      );
    },
    barColor: (value) => typeof value === "string" && value.length > 0,
    barHoverColor: (value) => typeof value === "string" && value.length > 0,
    xAxisTickInterval: (value) => typeof value === "number" && value > 0,
    tooltipBackgroundColor: (value) => typeof value === "string" && value.length > 0,
    tooltipTextColor: (value) => typeof value === "string" && value.length > 0
  };

  function getDefaultConfig() {
    return JSON.parse(JSON.stringify(defaultConfig));
  }

  function mergeConfig(userConfig = {}) {
    const merged = getDefaultConfig();
    
    for (const key in userConfig) {
      if (defaultConfig.hasOwnProperty(key) && configValidators[key](userConfig[key])) {
        if (key === "margin") {
          merged[key] = { ...merged[key], ...userConfig[key] };
        } else {
          merged[key] = userConfig[key];
        }
      } else if (defaultConfig.hasOwnProperty(key)) {
        console.warn(`Invalid value for config key "${key}", using default value.`);
      } else {
        console.warn(`Unknown config key "${key}", ignoring.`);
      }
    }
    
    return merged;
  }

  function validateConfig(config) {
    const errors = [];
    
    for (const key in configValidators) {
      if (config.hasOwnProperty(key)) {
        if (!configValidators[key](config[key])) {
          errors.push(`Invalid value for config key "${key}".`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  function createConfig(overrides = {}) {
    const merged = mergeConfig(overrides);
    const validation = validateConfig(merged);
    
    if (!validation.valid) {
      console.error("Configuration validation failed:", validation.errors);
    }
    
    return merged;
  }

  function getDataLoaderConfig(config) {
    return {
      dataUrl: config.dataUrl,
      dateFormat: config.dateFormat
    };
  }

  function getChartRendererConfig(config) {
    return {
      width: config.width,
      height: config.height,
      margin: config.margin,
      barColor: config.barColor,
      barHoverColor: config.barHoverColor,
      xAxisTickInterval: config.xAxisTickInterval,
      tooltipBackgroundColor: config.tooltipBackgroundColor,
      tooltipTextColor: config.tooltipTextColor
    };
  }

  return {
    getDefaultConfig: getDefaultConfig,
    mergeConfig: mergeConfig,
    validateConfig: validateConfig,
    createConfig: createConfig,
    getDataLoaderConfig: getDataLoaderConfig,
    getChartRendererConfig: getChartRendererConfig
  };
})();
