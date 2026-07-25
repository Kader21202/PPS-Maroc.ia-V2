"use strict";

const fs = require("fs");
const path = require("path");

class FragmentLoader {

  constructor({
    documentsPath
  }) {

    if (!documentsPath) {
      throw new Error(
        "FragmentLoader requires documentsPath."
      );
    }

    this.documentsPath = documentsPath;

  }

 load() {

  if (!fs.existsSync(this.documentsPath)) {
    throw new Error(
      `FragmentLoader documents path not found: ${this.documentsPath}`
    );
  }

 const entries = fs.readdirSync(
  this.documentsPath,
  {
    withFileTypes: true
  }
);

const files = entries.filter(entry => {
  return (
    entry.isFile() &&
    path.extname(entry.name).toLowerCase() === ".txt"
  );
});

const fragments = files.map(entry => {

  const filePath = path.join(
    this.documentsPath,
    entry.name
  );

  const text = fs.readFileSync(
    filePath,
    "utf8"
  );

  return {
    id: entry.name,
    text,
    source: filePath
  };

});

return fragments;

}

}

module.exports = {
  FragmentLoader
};