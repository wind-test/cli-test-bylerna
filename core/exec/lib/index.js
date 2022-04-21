'use strict';

const log = require('@wind-webcli/log')
const Package = require("@wind-webcli/package")

// 命令动态加载对应的npm包名映射
const SETTING = {
  init: '@wind-webcli/init',
};

function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  // 拿到commander对象本身
  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  const packageName = SETTING[cmdName]
  const packageVersion = 'latest'
  pkg = new Package({
    targetPath,
    storeDir,
    packageName,
    packageVersion
  })
  console.log('入口文件为：',pkg.getRootFilePath())
}

module.exports = exec;