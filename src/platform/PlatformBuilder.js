"use strict";

const { Platform } = require("./Platform");
const {
  PlatformConfig
} = require("../config/PlatformConfig");

class PlatformBuilder {
  build() {
    const config = new PlatformConfig();
    const platform = new Platform(config);

    return {
      config,
      platform
    };
  }
}

module.exports = {
  PlatformBuilder
};