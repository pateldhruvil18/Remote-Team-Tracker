/**
 * Device Detection and Responsive Utilities
 * Helps optimize UI based on device type and screen size
 */

import { useState, useEffect } from "react";

// Breakpoints matching our CSS
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  laptopSmall: 1024,
  laptop: 1200,
  laptopLarge: 1366,
  desktop: 1920,
};

/**
 * Get current screen size category
 */
export const getScreenSize = () => {
  const width = window.innerWidth;

  if (width <= BREAKPOINTS.mobile) return "mobile";
  if (width <= BREAKPOINTS.tablet) return "tablet";
  if (width <= BREAKPOINTS.laptopSmall) return "laptop-small";
  if (width <= BREAKPOINTS.laptop) return "laptop";
  if (width <= BREAKPOINTS.laptopLarge) return "laptop-large";
  return "desktop";
};

/**
 * Check if current screen is mobile
 */
export const isMobile = () => {
  return window.innerWidth <= BREAKPOINTS.mobile;
};

/**
 * Check if current screen is tablet
 */
export const isTablet = () => {
  const width = window.innerWidth;
  return width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;
};

/**
 * Check if current screen is laptop (any size)
 */
export const isLaptop = () => {
  const width = window.innerWidth;
  return width > BREAKPOINTS.tablet && width <= BREAKPOINTS.laptopLarge;
};

/**
 * Check if current screen is desktop
 */
export const isDesktop = () => {
  return window.innerWidth > BREAKPOINTS.laptopLarge;
};

/**
 * Get device type based on user agent and screen size
 */
export const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // Check for mobile devices
  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )
  ) {
    if (width <= BREAKPOINTS.mobile) return "mobile";
    if (width <= BREAKPOINTS.tablet) return "tablet";
  }

  // Check for touch devices (tablets/laptops with touch)
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    if (width <= BREAKPOINTS.tablet) return "tablet";
    if (width <= BREAKPOINTS.laptopLarge) return "laptop-touch";
  }

  // Desktop/laptop classification based on screen size
  if (width <= BREAKPOINTS.laptopSmall) return "laptop-small";
  if (width <= BREAKPOINTS.laptop) return "laptop";
  if (width <= BREAKPOINTS.laptopLarge) return "laptop-large";

  return "desktop";
};

/**
 * Get optimal grid columns based on screen size
 */
export const getOptimalGridColumns = (maxColumns = 4) => {
  const screenSize = getScreenSize();

  switch (screenSize) {
    case "mobile":
      return 1;
    case "tablet":
      return Math.min(2, maxColumns);
    case "laptop-small":
      return Math.min(3, maxColumns);
    case "laptop":
      return Math.min(4, maxColumns);
    case "laptop-large":
      return Math.min(5, maxColumns);
    default:
      return maxColumns;
  }
};

/**
 * Get optimal font size multiplier based on screen size
 */
export const getFontSizeMultiplier = () => {
  const screenSize = getScreenSize();

  switch (screenSize) {
    case "mobile":
      return 0.75;
    case "tablet":
      return 0.85;
    case "laptop-small":
      return 0.9;
    case "laptop":
      return 0.95;
    case "laptop-large":
      return 1;
    default:
      return 1.1;
  }
};

/**
 * Get optimal spacing based on screen size
 */
export const getOptimalSpacing = (baseSpacing = 16) => {
  const multiplier = getFontSizeMultiplier();
  return Math.round(baseSpacing * multiplier);
};

/**
 * Check if device has high DPI (retina-like display)
 */
export const isHighDPI = () => {
  return window.devicePixelRatio > 1.5;
};

/**
 * Get viewport dimensions
 */
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.innerHeight,
  };
};

/**
 * Hook for responsive design (React hook)
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
      setDeviceType(getDeviceType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    screenSize,
    deviceType,
    isMobile: screenSize === "mobile",
    isTablet: screenSize === "tablet",
    isLaptop: ["laptop-small", "laptop", "laptop-large"].includes(screenSize),
    isDesktop: screenSize === "desktop",
    viewport: getViewportDimensions(),
    optimalGridColumns: getOptimalGridColumns,
    fontSizeMultiplier: getFontSizeMultiplier(),
    optimalSpacing: getOptimalSpacing,
  };
};

/**
 * CSS class generator for responsive design
 */
export const getResponsiveClasses = (baseClass, variants = {}) => {
  const screenSize = getScreenSize();
  const classes = [baseClass];

  // Add screen size specific class
  classes.push(`${baseClass}--${screenSize}`);

  // Add variant classes if provided
  if (variants[screenSize]) {
    classes.push(variants[screenSize]);
  }

  return classes.join(" ");
};

/**
 * Performance optimization: Debounced resize handler
 */
export const createDebouncedResizeHandler = (callback, delay = 250) => {
  let timeoutId;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

/**
 * Get optimal image sizes for responsive images
 */
export const getOptimalImageSizes = () => {
  const screenSize = getScreenSize();
  const isHighDPIDevice = isHighDPI();

  const baseSizes = {
    mobile: { width: 320, height: 240 },
    tablet: { width: 768, height: 576 },
    "laptop-small": { width: 1024, height: 768 },
    laptop: { width: 1200, height: 900 },
    "laptop-large": { width: 1366, height: 1024 },
    desktop: { width: 1920, height: 1440 },
  };

  const size = baseSizes[screenSize] || baseSizes.desktop;

  // Double the size for high DPI displays
  if (isHighDPIDevice) {
    return {
      width: size.width * 2,
      height: size.height * 2,
    };
  }

  return size;
};

// Export default object with all utilities
export default {
  BREAKPOINTS,
  getScreenSize,
  isMobile,
  isTablet,
  isLaptop,
  isDesktop,
  getDeviceType,
  getOptimalGridColumns,
  getFontSizeMultiplier,
  getOptimalSpacing,
  isHighDPI,
  getViewportDimensions,
  useResponsive,
  getResponsiveClasses,
  createDebouncedResizeHandler,
  getOptimalImageSizes,
};
