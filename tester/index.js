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
