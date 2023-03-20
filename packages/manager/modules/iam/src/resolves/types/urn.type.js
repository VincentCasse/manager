import { isEqual } from 'lodash-es';
import { ENTITY } from '@iam/constants';

const urnType = 'urn';
const urnPattern = /urn:v[0-9]:(?:eu|ca|us):[a-z]+:[\w:\s/-]+/;
const urnRegExp = /^urn:v([0-9]):(eu|ca|us):([a-z]+):([\w:\s/-]+)$/;

/**
 * Encode a urn object to a string
 * @param {Object} object
 * @returns {string}
 */
const encodeUrn = (object) => {
  const { version, region, entity, components } = object;
  return [
    'urn',
    `v${version}`,
    region.toLowerCase(),
    entity,
    ...components,
  ].join(':');
};

/**
 * Decode a urn object from a string
 * @param {string} string
 * @returns {Object}
 */
const decodeUrn = (string) => {
  const [, version, region, entity, components] = urnRegExp.exec(string);
  return {
    version: parseInt(version, 10),
    region: region.toUpperCase(),
    entity,
    components: components.split(':'),
  };
};

/**
 * Whether the given object is of type urn
 * @param {Object} object
 * @returns {boolean}
 */
const isUrn = (object) => {
  if (!object) return false;
  const { version, region, entity, components } = object;
  return (
    version > 0 &&
    ['EU', 'US', 'CA'].includes(region) &&
    Object.values(ENTITY).includes(entity) &&
    components.length > 0
  );
};

/**
 * Whether the given urns objects are the same
 * @param {Object} urnA
 * @param {Object} urnB
 * @returns {boolean}
 */
const areUrnEquals = (urnA, urnB) => urnA === urnB || isEqual(urnA, urnB);

export { urnType, decodeUrn, encodeUrn };
export default {
  decode: decodeUrn,
  encode: encodeUrn,
  equals: areUrnEquals,
  is: isUrn,
  pattern: urnPattern,
  type: urnType,
};
