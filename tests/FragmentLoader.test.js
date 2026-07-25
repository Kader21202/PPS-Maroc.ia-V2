"use strict";

const {
  FragmentLoader
} = require("../src/loaders/FragmentLoader");

console.log(
  typeof FragmentLoader === "function"
);

const loader = new FragmentLoader({
  documentsPath: "."
});

console.log(
  loader.documentsPath === "."
);
let missingPathError = false;

try {

  new FragmentLoader({});

} catch (error) {

  missingPathError =
    error.message ===
    "FragmentLoader requires documentsPath.";

}

console.log(missingPathError);

const missingDirectoryLoader = new FragmentLoader({
  documentsPath: "./directory-that-does-not-exist"
});

let missingDirectoryError = false;

try {

  missingDirectoryLoader.load();

} catch (error) {

  missingDirectoryError =
    error.message ===
    "FragmentLoader documents path not found: ./directory-that-does-not-exist";

}

console.log(missingDirectoryError);

const emptyDirectoryLoader = new FragmentLoader({
  documentsPath: "./tests"
});

const emptyDirectoryFragments =
  emptyDirectoryLoader.load();

console.log(
  Array.isArray(emptyDirectoryFragments)
);
console.log(
  emptyDirectoryFragments.length === 0
);
const fixtureLoader = new FragmentLoader({
  documentsPath: "./tests/fixtures/fragments"
});

const fixtureFragments = fixtureLoader.load();

console.log(
  Array.isArray(fixtureFragments)
);
console.log(
  fixtureFragments.length === 1
);
console.log(
  fixtureFragments[0].id === "document-test.txt"
);
console.log(
  fixtureFragments[0].text.includes(
    "Le PPS a été créé le 20 décembre 1974."
  )
);
console.log(
  fixtureFragments[0].source.endsWith(
    "tests\\fixtures\\fragments\\document-test.txt"
  )
);
console.log(
  Object.keys(fixtureFragments[0]).length === 3
);