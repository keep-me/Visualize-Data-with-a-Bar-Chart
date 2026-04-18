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

// Configuration Panel Controller
const ConfigPanelController = (function() {
  const defaultConfig = {
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 100, left: 50 },
    barColor: "#337ab7",
    barHoverColor: "#23527c",
    xAxisTickInterval: 1,
    tooltipBackgroundColor: "#000000",
    tooltipTextColor: "#ffffff"
  };

  const presets = {
    blue: {
      barColor: "#3498db",
      barHoverColor: "#2980b9",
      tooltipBackgroundColor: "#2c3e50",
      tooltipTextColor: "#ffffff"
    },
    green: {
      barColor: "#2ecc71",
      barHoverColor: "#27ae60",
      tooltipBackgroundColor: "#27ae60",
      tooltipTextColor: "#ffffff"
    },
    red: {
      barColor: "#e74c3c",
      barHoverColor: "#c0392b",
      tooltipBackgroundColor: "#c0392b",
      tooltipTextColor: "#ffffff"
    },
    dark: {
      barColor: "#34495e",
      barHoverColor: "#2c3e50",
      tooltipBackgroundColor: "#1a252f",
      tooltipTextColor: "#ecf0f1"
    }
  };

  function init() {
    setupEventListeners();
    updateColorPreviews();
  }

  function setupEventListeners() {
    // Color inputs - update preview immediately
    const colorInputs = [
      { id: "bar-color", previewId: "bar-color-preview" },
      { id: "bar-hover-color", previewId: "bar-hover-color-preview" },
      { id: "tooltip-bg-color", previewId: "tooltip-bg-color-preview" },
      { id: "tooltip-text-color", previewId: "tooltip-text-color-preview" }
    ];

    colorInputs.forEach(input => {
      const element = document.getElementById(input.id);
      const preview = document.getElementById(input.previewId);
      
      if (element && preview) {
        element.addEventListener("input", function() {
          preview.style.backgroundColor = this.value;
        });
      }
    });

    // Preset buttons
    const presetButtons = [
      { id: "preset-blue", preset: presets.blue },
      { id: "preset-green", preset: presets.green },
      { id: "preset-red", preset: presets.red },
      { id: "preset-dark", preset: presets.dark }
    ];

    presetButtons.forEach(btn => {
      const element = document.getElementById(btn.id);
      if (element) {
        element.addEventListener("click", function() {
          applyPreset(btn.preset);
        });
      }
    });

    // Apply button
    const applyBtn = document.getElementById("apply-config");
    if (applyBtn) {
      applyBtn.addEventListener("click", applyConfiguration);
    }

    // Reset button
    const resetBtn = document.getElementById("reset-config");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetToDefault);
    }
  }

  function updateColorPreviews() {
    const colorInputs = [
      { id: "bar-color", previewId: "bar-color-preview" },
      { id: "bar-hover-color", previewId: "bar-hover-color-preview" },
      { id: "tooltip-bg-color", previewId: "tooltip-bg-color-preview" },
      { id: "tooltip-text-color", previewId: "tooltip-text-color-preview" }
    ];

    colorInputs.forEach(input => {
      const element = document.getElementById(input.id);
      const preview = document.getElementById(input.previewId);
      
      if (element && preview) {
        preview.style.backgroundColor = element.value;
      }
    });
  }

  function getFormValues() {
    const config = {};

    // Dimensions
    const width = document.getElementById("chart-width");
    const height = document.getElementById("chart-height");
    if (width) config.width = parseInt(width.value);
    if (height) config.height = parseInt(height.value);

    // Margin
    config.margin = {};
    const marginInputs = [
      { id: "margin-top", key: "top" },
      { id: "margin-right", key: "right" },
      { id: "margin-bottom", key: "bottom" },
      { id: "margin-left", key: "left" }
    ];

    marginInputs.forEach(input => {
      const element = document.getElementById(input.id);
      if (element) {
        config.margin[input.key] = parseInt(element.value);
      }
    });

    // Colors
    const barColor = document.getElementById("bar-color");
    const barHoverColor = document.getElementById("bar-hover-color");
    const tooltipBgColor = document.getElementById("tooltip-bg-color");
    const tooltipTextColor = document.getElementById("tooltip-text-color");

    if (barColor) config.barColor = barColor.value;
    if (barHoverColor) config.barHoverColor = barHoverColor.value;
    if (tooltipBgColor) {
      // Convert hex to rgba with opacity for tooltip background
      config.tooltipBackgroundColor = hexToRgba(tooltipBgColor.value, 0.8);
    }
    if (tooltipTextColor) config.tooltipTextColor = tooltipTextColor.value;

    // Axis settings
    const xTickInterval = document.getElementById("x-tick-interval");
    if (xTickInterval) config.xAxisTickInterval = parseInt(xTickInterval.value);

    return config;
  }

  function hexToRgba(hex, alpha) {
    // Remove # if present
    hex = hex.replace("#", "");
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applyPreset(preset) {
    // Update form values
    if (preset.barColor) {
      const barColor = document.getElementById("bar-color");
      const barColorPreview = document.getElementById("bar-color-preview");
      if (barColor) barColor.value = preset.barColor;
      if (barColorPreview) barColorPreview.style.backgroundColor = preset.barColor;
    }
    
    if (preset.barHoverColor) {
      const barHoverColor = document.getElementById("bar-hover-color");
      const barHoverColorPreview = document.getElementById("bar-hover-color-preview");
      if (barHoverColor) barHoverColor.value = preset.barHoverColor;
      if (barHoverColorPreview) barHoverColorPreview.style.backgroundColor = preset.barHoverColor;
    }
    
    if (preset.tooltipBackgroundColor) {
      const tooltipBgColor = document.getElementById("tooltip-bg-color");
      const tooltipBgColorPreview = document.getElementById("tooltip-bg-color-preview");
      if (tooltipBgColor) tooltipBgColor.value = preset.tooltipBackgroundColor;
      if (tooltipBgColorPreview) tooltipBgColorPreview.style.backgroundColor = preset.tooltipBackgroundColor;
    }
    
    if (preset.tooltipTextColor) {
      const tooltipTextColor = document.getElementById("tooltip-text-color");
      const tooltipTextColorPreview = document.getElementById("tooltip-text-color-preview");
      if (tooltipTextColor) tooltipTextColor.value = preset.tooltipTextColor;
      if (tooltipTextColorPreview) tooltipTextColorPreview.style.backgroundColor = preset.tooltipTextColor;
    }

    // Apply immediately
    applyConfiguration();
  }

  function applyConfiguration() {
    const config = getFormValues();
    console.log("Applying configuration:", config);
    
    try {
      BarChartApp.updateConfig(config);
      showNotification("Configuration applied successfully!", "success");
    } catch (error) {
      console.error("Failed to apply configuration:", error);
      showNotification("Failed to apply configuration. Check console for details.", "error");
    }
  }

  function resetToDefault() {
    // Reset form values to default
    const width = document.getElementById("chart-width");
    const height = document.getElementById("chart-height");
    
    if (width) width.value = defaultConfig.width;
    if (height) height.value = defaultConfig.height;

    // Reset margin
    const marginInputs = [
      { id: "margin-top", value: defaultConfig.margin.top },
      { id: "margin-right", value: defaultConfig.margin.right },
      { id: "margin-bottom", value: defaultConfig.margin.bottom },
      { id: "margin-left", value: defaultConfig.margin.left }
    ];

    marginInputs.forEach(input => {
      const element = document.getElementById(input.id);
      if (element) element.value = input.value;
    });

    // Reset colors
    const barColor = document.getElementById("bar-color");
    const barColorPreview = document.getElementById("bar-color-preview");
    if (barColor) barColor.value = defaultConfig.barColor;
    if (barColorPreview) barColorPreview.style.backgroundColor = defaultConfig.barColor;

    const barHoverColor = document.getElementById("bar-hover-color");
    const barHoverColorPreview = document.getElementById("bar-hover-color-preview");
    if (barHoverColor) barHoverColor.value = defaultConfig.barHoverColor;
    if (barHoverColorPreview) barHoverColorPreview.style.backgroundColor = defaultConfig.barHoverColor;

    const tooltipBgColor = document.getElementById("tooltip-bg-color");
    const tooltipBgColorPreview = document.getElementById("tooltip-bg-color-preview");
    if (tooltipBgColor) tooltipBgColor.value = defaultConfig.tooltipBackgroundColor;
    if (tooltipBgColorPreview) tooltipBgColorPreview.style.backgroundColor = defaultConfig.tooltipBackgroundColor;

    const tooltipTextColor = document.getElementById("tooltip-text-color");
    const tooltipTextColorPreview = document.getElementById("tooltip-text-color-preview");
    if (tooltipTextColor) tooltipTextColor.value = defaultConfig.tooltipTextColor;
    if (tooltipTextColorPreview) tooltipTextColorPreview.style.backgroundColor = defaultConfig.tooltipTextColor;

    // Reset axis settings
    const xTickInterval = document.getElementById("x-tick-interval");
    if (xTickInterval) xTickInterval.value = defaultConfig.xAxisTickInterval;

    // Apply default configuration
    try {
      BarChartApp.updateConfig(defaultConfig);
      showNotification("Reset to default configuration!", "success");
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      showNotification("Failed to reset configuration.", "error");
    }
  }

  function showNotification(message, type) {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      ${type === "success" 
        ? "background: linear-gradient(135deg, #2ecc71, #27ae60); color: white;" 
        : "background: linear-gradient(135deg, #e74c3c, #c0392b); color: white;"}
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;

    // Add animation style
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  return {
    init: init,
    applyConfiguration: applyConfiguration,
    resetToDefault: resetToDefault,
    getFormValues: getFormValues
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
  
  // Initialize configuration panel controller
  ConfigPanelController.init();
  
  // Expose to global scope for debugging
  window.BarChartApp = BarChartApp;
  window.ConfigPanelController = ConfigPanelController;
});
