'use strict';

const log = require('@wind-webcli/log');
const Package = require('@wind-webcli/package');
const path = require('path');
const cp = require('child_process')
const { exec: spawn } = require('@wind-webcli/utils')

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
    // 在主进程中进行
    // require(rootFile).call(null, Array.from(arguments));
    
    // 在子进程中进行
    try {
      const args = Array.from(arguments)
      const cmd = args[args.length - 1]
      // 将command对象中的无关属性去掉
      const obj = {}
      Object.keys(cmd).forEach(key => {
        if (!key.startsWith('_') && cmd.hasOwnProperty(key) && key !== 'parent') {
          obj[key] = cmd[key]
        }
      });
      args[args.length - 1] = obj
      const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
      // const child = cp.spawn('node', ['-e', code], {
      //   cwd: process.cwd(),
      //   stdio: 'inherit'
      // })
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      child.on('error', (err) => {
        log.error(err.message)
        process.exit(1)
      })

      child.on('exit', (e) => {
        log.info('命令执行完毕 e = ', e)
        process.exit(e)
      })
    } catch (error) {
      log.error(error.message)
    }
  }
}

module.exports = exec;
