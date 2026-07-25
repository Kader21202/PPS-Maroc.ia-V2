"use strict";

class PlatformConfig {
  constructor() {
    this.name = "PPS-Maroc.ia V2";
    this.version = "2.0.0";
    this.environment = "development";
  }

  toObject() {
    return {
      name: this.name,
      version: this.version,
      environment: this.environment
    };
  }
}

module.exports = {
  PlatformConfig
};