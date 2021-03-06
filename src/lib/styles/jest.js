const mockValues = {
  bool: '{false}',
  string: '"mockString"',
  any: '"mockAny"',
  number: '{404}',
  func: '{() => null}',
  array: '{[]}',
  element: '"mockElement"',
};

function typeName(key, props) {
  const prop = props[key];
  if (prop.flowType) {
    return prop.flowType.name;
  }
  return prop.type.name;
}


// react-docgen doesn't parse stateless functions yet so props will be
// undefined in that case, even if they are in the function signature
function renderSnippet(unitName, props = {}) {
  const requiredKeys = Object.keys(props).filter(k => props[k].required);

  let automatable = true;
  const propStrings = requiredKeys.map((k) => {
    const val = mockValues[typeName(k, props)];
    if (val) {
      return `${k}=${val}`;
    }

    automatable = false;
    return `${k}="TODO mock"`;
  });

  const fn = automatable ? 'it' : 'xit';

  return `
  ${fn}('renders', () => {
    const comp = <${unitName} ${propStrings.join(' ')} />;
    const wrapper = shallow(comp);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
`;
}

function unitStub(unitName, reactInfo) {
  const its = [`
  it('exists', () => {
    expect(${unitName}).toBeTruthy();
  });
`];

  if (reactInfo) {
    its.push(renderSnippet(unitName, reactInfo.props));
  }

  return `describe('${unitName}', () => {${its.join('')}});`;
}

function specUnit({ exportsInfo, reactInfo }) {
  const parts = [];

  if (reactInfo) {
    parts.push(`import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
`);
  }

  if (exportsInfo.exportsDefault) {
    // React info only available on the default export
    parts.push(unitStub(exportsInfo.moduleName, reactInfo));
  }

  for (const namedExport of exportsInfo.namedExportNames) {
    parts.push(unitStub(namedExport));
  }

  return parts.join('\n');
}

module.exports = specUnit;
