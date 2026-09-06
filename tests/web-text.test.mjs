import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWebText} from '../scripts/build.mjs';
test('Static CSS and JS normalize Windows CRLF before manifest hashing',()=>{
 assert.equal(normalizeWebText('a\r\nb\r\nc\r'),'a\nb\nc\n');
});
test('LF web content is stable and normalization preserves text characters',()=>{
 const text='A.X.L. — São Paulo\nbody { color: white; }\n';
 assert.equal(normalizeWebText(text),text);
 assert.equal(normalizeWebText(normalizeWebText('a\r\nb')), 'a\nb');
});
