// Monkey-patch fs with graceful-fs to queue and retry on EMFILE (too many open files) on Windows
const fs = require("fs");
try {
  const gracefulFs = require("graceful-fs");
  gracefulFs.gracefulify(fs);
} catch (e) {
  // Ignore if graceful-fs is unavailable
}

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Limit concurrent worker threads on Windows to prevent file handle exhaustion (EMFILE)
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./global.css" });
