'use strict';

function add(a, b) {
  console.log("tools库，调用函数add,入参：%d, %d",a ,b)
  return a + b;
}
function min(a, b) {
  console.log("tools库，调用函数min,入参：%d, %d",a ,b)
  return Math.min(a, b);
}

// 针对windows平台，对执行的脚本进行修改
function exec(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

module.exports = { add, min, exec };
