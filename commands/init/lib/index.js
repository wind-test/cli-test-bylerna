'use strict';

const Command = require('@wind-webcli/command');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const log = require('@wind-webcli/log')
class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0]; // 项目名称
    this.options = this._argv[1]; // 参数选项
    this.force = this.options.force; // 是否强制清空当前目录
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }
  async exec() {
    try {
      // 1. 准备阶段
      await this.prepare();
    } catch (error) {
      log.error(error.message);
    }
  }

  async prepare() {
    // 判断当前执行目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      // 不为空的话需要询问是否清空当前目录
      let isContinue = false;
      if (!this.force) {
        // 询问是否继续操作
        isContinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'isContinue',
            default: false,
            message: '当前目录不为空，是否要继续创建项目？',
          })
        ).isContinue;
        if (!isContinue) {
          return;
        }
      }
      if (isContinue || this.force) {
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '该操作会清空目录下的文件，确定要继续操作吗？',
        });
        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        } else {
          return;
        }
      }
    }
    log.info('开始获取模板信息');
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0,
    );
    return !fileList || fileList.length <= 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
