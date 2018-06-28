import './polyfill';

function aaa(A) {
  return A;
}

@aaa()
export default class A {
  static x = 1;
  b = () => {};
  aaa() {}
}

alert(A.x);

const map = new Map();

map.set('aaa', '1');

function* bbb() {
  yield 1;
}

async function ccc() {
  await Promise.resolve();
  return 2;
}

window.xxx1 = bbb();
window.xxx2 = ccc();