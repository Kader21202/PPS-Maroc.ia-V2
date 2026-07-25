"use strict";

class Platform {
  constructor(config) {
    if (!config) {
      throw new Error("Platform requires PlatformConfig.");
    }

    this.config = config;
    this.name = this.config.name;
    this.status = "created";
  }

  start() {
    this.status = "initialized";

    return this.getStatus();
  }

  getStatus() {
    return {
      name: this.name,
      version: this.config.version,
      environment: this.config.environment,
      status: this.status
    };
  }
}

module.exports = {
  Platform
};