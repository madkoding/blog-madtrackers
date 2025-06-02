import { generateUserHash } from '../src/utils/hashUtils';

const username = 'test_chile';
const hash = generateUserHash(username);

console.log(`Usuario: ${username}`);
console.log(`Hash generado: ${hash}`);
console.log(`URL de seguimiento segura: /seguimiento/${hash}`);
