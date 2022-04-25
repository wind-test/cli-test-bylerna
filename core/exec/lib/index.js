'use strict';

const log = require('@wind-webcli/log');
const Package = require('@wind-webcli/package');
const path = require('path');

// 命令动态加载对应的npm包名映射
const SETTING = {
  init: '@wind-webcli/init',
};

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  // 拿到commander对象本身
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTING[cmdName];
  const packageVersion = 'latest';
  if (!targetPath) {
    //生成缓存路径
    targetPath = path.resolve(homePath, 'dependencies');
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('targetPath:', targetPath);
    log.verbose('storeDir:', storeDir);
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    if (await pkg.exists()) {
      // 更新npm包
      await pkg.update()
    } else {
      // 下载npm包
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    // require(rootFile).call(null, arguments);
    require(rootFile).call(null, Array.from(arguments));
  }
}

module.exports = exec;
