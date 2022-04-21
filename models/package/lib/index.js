'use strict';

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

  // 打印类的属性,测试用
  printAttr() {
    console.log(this.targetPath, this.storeDir, this.packageName, this.packageVersion);
  }

  // TO-DO 判断当前package是否存在
  exists() {}

  // TO-DO 更新package包
  update() {}

  // TO-DO 下载package包
  install() {}

  // TO-DO 获取入口文件路径
  getRootFilePath() {}
}

module.exports = Package;
