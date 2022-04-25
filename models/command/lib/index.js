'use strict';

const log = require('@wind-webcli/log');
const constants = require('./consts');
const semver = require('semver');

class Command {
  constructor(argv) {
      console.log(argv)
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain.catch((e) => log.error(e.message));
    });
  }

  // 检查Node版本号
  checkNodeVersion() {
    //第一步，获取当前Node版本号
    const currentVersion = process.version;
    const lastVersion = constants.LOWEST_NODE_VERSION;
    //第二步，对比最低版本号
    if (!semver.gte(currentVersion, lastVersion)) {
      log.error(colors.red(`wind-webcli 需要安装v${lastVersion}以上版本的Node.js`));
    }
  }

  exec() {
    throw 'exec方法必须实现';
  }

  init() {
    throw 'init方法必须实现';
  }
}

module.exports = Command;
