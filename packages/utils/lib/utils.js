'use strict';

function add(a, b) {
  console.log("tools库，调用函数add,入参：%d, %d",a ,b)
  return a + b;
}
function min(a, b) {
  console.log("tools库，调用函数min,入参：%d, %d",a ,b)
  return Math.min(a, b);
}

module.exports = { add, min };
