const path = require('path');

const describeModule = require('./describeModule');
const importDeclaration = require('./importDeclaration');
const styles = require('./styles');

function generateSpecFile(moduleName, specPath, unitPath, src, style = 'jest') {
  const moduleInfo = describeModule(moduleName, src);

  if (!moduleInfo.exportsInfo.hasExports) {
    throw new Error('No exports in', unitPath);
  }

  const specUnit = styles[style];

  const spec = specUnit(moduleInfo);

  // why doesn't `relative` work without the slice?
  const importPath = path.relative(specPath, unitPath).slice(3);
  const importLines = importDeclaration(moduleInfo, importPath);

  const fileContents = `/* @lazyspec (remove to manage manually) */
/* @flow */
/* eslint-disable max-len */
${importLines}

${spec}
`;

  return fileContents;
}

module.exports = generateSpecFile;