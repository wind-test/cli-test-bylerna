'use strict';

const pkgDir = require('pkg-dir').sync;
const formatPath = require('@wind-webcli/format-path');
const path = require('path');
const npminstall = require('npminstall')
const fsExtra = require('fs-extra')
const pathExits = require('path-exists')
const { getNpmLatestVersion, getDefaultRegistry } = require('@wind-webcli/get-npm-info')
class Package {
  constructor({ targetPath, storeDir, packageName, packageVersion }) {
    // package目标路径
    this.targetPath = targetPath;
    // package存储路径
    this.storeDir = storeDir;
    // package包名
    this.packageName = packageName;
    // package版本号
    this.packageVersion = packageVersion;
  }

  async prepare() {
    if (this.storeDir && !pathExits(this.storeDir)) {
      // 如果缓存路径不存在，则创建一个
      fsExtra.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    console.log('packageVersion', this.packageVersion)
  }

  // TO-DO 判断当前package是否存在
  async exists() {}

  // TO-DO 更新package包
  async update() {}

  // 下载package包
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion,
      }],
    })
  }

  // 获取入口文件路径
  getRootFilePath() {
    // 1. 获取package.json所在目录
    const dir = pkgDir(this.targetPath);
    if (dir) {
      // 2. 读取package.json
      const pkgFile = require(path.resolve(dir, 'package.json'));
      // 3. 寻找main/lib
      if (pkgFile && pkgFile.main) {
        // 4. 路径的兼容(macOS/windows)
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }
    return null;
  }
}

module.exports = Package;
