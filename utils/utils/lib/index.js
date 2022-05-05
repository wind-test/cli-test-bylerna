'use strict';

const { Spinner } = require('cli-spinner');

// 针对windows平台，对执行的脚本进行修改
function exec(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

// 命令行loading效果
function spinnerStart(msg, spinnerString ='|\-\\') {
  const spinner = new Spinner(`${msg} %s`)
  spinner.setSpinnerString(spinnerString)
  spinner.start()
  return spinner
}

// 命令行缓冲效果
function sleep(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = { exec, spinnerStart, sleep };
