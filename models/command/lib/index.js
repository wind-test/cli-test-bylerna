'use strict';

const log = require('@wind-webcli/log');
const constants = require('./consts');
const semver = require('semver');

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不得为空');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须维数组');
    }
    if (argv.length < 1) {
      throw new Error('参数列表必须维数组');
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch((e) => log.error(e.message));
    });
  }

  // 初始化参数
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.splice(0, this._argv.length - 1)
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
    throw new Error('exec方法必须实现');
  }

  init() {
    throw new Error('init方法必须实现');
  }
}

module.exports = Command;
