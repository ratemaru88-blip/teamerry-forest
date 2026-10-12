const fs = require('node:fs');
const crypto = require('node:crypto');
const acorn = require(process.env.OMIKUJI_ACORN_PATH || 'acorn');
function extract(file) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = acorn.parse(source, {ecmaVersion:'latest', sourceType:'module'});
  let results;
  const literal = node => {
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    if (node.type === 'ArrayExpression') return node.elements.map(literal);
    if (node.type === 'ObjectExpression') return Object.fromEntries(node.properties.map(property => {
      if (property.type !== 'Property' || property.computed || property.kind !== 'init') throw Error('Unexpected property');
      return [property.key.name || property.key.value, literal(property.value)];
    }));
    throw Error('Only string data is allowed: ' + node.type);
  };
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'VariableDeclarator' && node.id.name === 'fortunes') results = literal(node.init);
    for (const child of Object.values(node)) if (Array.isArray(child)) child.forEach(walk); else if (child && typeof child === 'object') walk(child);
  };
  walk(ast);
  if (!results?.length) throw Error('No fortune data');
  return {results, sha256:crypto.createHash('sha256').update(source).digest('hex')};
}
module.exports = {extract};
if (require.main === module) console.log(JSON.stringify(extract(process.argv[2]), null, 2));
