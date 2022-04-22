'use strict';

const pkgDir = require('pkg-dir').sync;
const formatPath = require('@wind-webcli/format-path');
const path = require('path');
const npminstall = require('npminstall');
const fsExtra = require('fs-extra');
const pathExits = require('path-exists');
const { getNpmLatestVersion, getDefaultRegistry } = require('@wind-webcli/get-npm-info');
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
      fsExtra.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  // 获取缓存路径
  get cacheFilePath() {
    const cachePrefix = this.packageName.replace('/', '_');
    return path.resolve(
      this.storeDir,
      `_${cachePrefix}@${this.packageVersion}@${this.packageName}`,
    );
  }

  // 获取特定版本的缓存路径
  getSpecificCacheFilePath(packageVersion) {
    const cachePrefix = this.packageName.replace('/', '_');
    return path.resolve(this.storeDir, `_${cachePrefix}@${packageVersion}@${this.packageName}`);
  }

  // 判断当前package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExits(this.cacheFilePath);
    } else {
      return pathExits(this.targetPath);
    }
  }

  // 更新package包
  async update() {
    // 获取最新版本号
    const latestVersion = await getNpmLatestVersion(this.packageName);
    // 查询版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestVersion);
    // 如果不存在，则直接安装最新版本
    if (!pathExits(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestVersion,
          },
        ],
      });
      this.packageVersion = latestVersion;
    } else {
      this.packageVersion = latestVersion;
    }
    return latestFilePath;
  }

  // 下载package包
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  // 获取入口文件路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录
      const dir = pkgDir(targetPath);
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
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
