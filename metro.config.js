const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const sharedPath = path.resolve(__dirname, "../family-planner-shared");

const config = getDefaultConfig(__dirname);

config.watchFolders = [sharedPath];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(sharedPath, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
