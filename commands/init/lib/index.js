'use strict';

const Command = require('@wind-webcli/command');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const log = require('@wind-webcli/log');
const semver = require('semver');
const { TEMPLATE_LIST, WHITELIST_CMD } = require('./consts');
const Package = require('@wind-webcli/package');
const path = require('path');
const userHome = require('user-home');
const { spinnerStart, sleep, execAsync } = require('@wind-webcli/utils');
const ejs = require('ejs');
const glob = require('glob');
class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0]; // 项目名称
    this.options = this._argv[1]; // 参数选项
    this.force = this.options.force; // 是否强制清空当前目录
  }
  async exec() {
    try {
      // 1. 准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 下载模板
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        // 安装模板
        await this.installTemplate();
      }
    } catch (error) {
      log.error(error.message);
    }
  }

  // 准备阶段
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
          const spinner = spinnerStart('正在清空目录中...');
          await sleep();
          await fse.emptyDir(localPath);
          spinner.stop(true)
        } else {
          return;
        }
      }
    }
    return this.getProjectInfo();
  }

  // 下载模板
  async downloadTemplate() {
    const templateInfo = TEMPLATE_LIST.find((i) => i.value === this.projectInfo.projectTemplate);
    this.templateInfo = templateInfo;
    const { value, version } = templateInfo;
    const targetPath = path.resolve(userHome, '.wind-webcli', 'template');
    const storeDir = path.resolve(userHome, '.wind-webcli', 'template', 'node_modules');
    const templatePkg = new Package({
      targetPath,
      storeDir,
      packageName: value,
      packageVersion: version,
    });
    if (!(await templatePkg.exists())) {
      // 下载模板
      const spinner = spinnerStart('开始下载模板中...');
      await sleep();
      try {
        await templatePkg.install();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templatePkg.exists()) {
          log.success('下载模板成功');
          this.templatePkg = templatePkg;
        }
      }
    } else {
      // 更新模板
      const spinner = spinnerStart('正在更新模板中...');
      await sleep();
      try {
        await templatePkg.update();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templatePkg.exists()) {
          log.success('更新模板成功');
          this.templatePkg = templatePkg;
        }
      }
    }
  }

  // 安装模板
  async installTemplate() {
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = 'normal';
      }
      if (this.templateInfo.type === 'normal') {
        // 标准模板安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === 'custom') {
        // 自定义模板安装
        await this.installCustomTemplate()
      } else {
        throw new Error('无法识别的模板类型');
      }
    } else {
      throw new Error('项目模板信息不惨在');
    }
  }

  // 执行模板中的脚本
  async execCommand(command, errMsg) {
    if (command) {
      const cmdArray = command.split(' ');
      const cmd = cmdArray[0];
      if (WHITELIST_CMD.includes(cmd)) {
        const args = cmdArray.slice(1);
        const res = await execAsync(cmd, args, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
        if (res !== 0) {
          throw new Error(errMsg);
        }
      } else {
        throw new Error('不合法的命令：', cmd);
      }
    }
  }

  // ejs模板渲染
  async ejsRender({ ignore }) {
    const dir = process.cwd();
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      glob(
        '**',
        {
          cwd: dir,
          ignore: ignore,
          nodir: true, // 不处理文件夹
        },
        (err, files) => {
          if (err) {
            reject(err);
          }
          Promise.all(
            files.map((file) => {
              const filePath = path.resolve(dir, file);
              return new Promise((res, rej) => {
                ejs.renderFile(filePath, projectInfo, {}, (error, result) => {
                  if (error) {
                    rej(error);
                  } else {
                    fse.writeFileSync(filePath, result);
                    res(filePath);
                  }
                });
              });
            }),
          )
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        },
      );
    });
  }

  // 标准模板安装
  async installNormalTemplate() {
    let spinner = spinnerStart('正在安装模板中...');
    await sleep();
    try {
      const templatePath = path.resolve(this.templatePkg.cacheFilePath, 'template');
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
      log.success('模板安装成功');
    }
    // ejs渲染
    const templateIgnore = this.templateInfo.ignore || [];
    const ignore = ['**/node_modules/**', ...templateIgnore];
    await this.ejsRender({ ignore });
    // 执行脚本
    const { installCmd, startCmd } = this.templateInfo;
    await this.execCommand(installCmd, '安装依赖失败');
    await this.execCommand(startCmd, '启动模板失败');
  }

  // 自定义模板安装
  async installCustomTemplate() {
    // 获取自定义模板的入口文件，并执行它。
    if (await this.templatePkg.exists()) {
      log.notice('开始安装自定义模板');
      const rootFile = this.templatePkg.getRootFilePath();
      if (fs.existsSync(rootFile)) {
        const templatePath = path.resolve(this.templatePkg.cacheFilePath, 'template');
        const options = {
          templateInfo: this.templateInfo,
          projectInfo: this.projectInfo,
          sourcePath: templatePath,
          targetPath: process.cwd(),
        }
        const code = `require('${rootFile}')(${JSON.stringify(options)})`
        log.verbose('code', code)
        await execAsync('node', ['-e', code], { stdio: 'inherit', cwd: process.cwd() });
        log.success('自定义模板安装成功');
      }
    }else {
      throw new Error('自定义模板入口文件不存在！');
    }
  }

  // 判断目录是否为空
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0,
    );
    return !fileList || fileList.length <= 0;
  }

  // 获取填写的项目信息
  async getProjectInfo() {
    // 检查项目名称是否合法
    function isValidName(v) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
    }
    let isProjectNameValid = false;
    let projectInfo = {};
    if (isValidName(this.projectName)) {
      isProjectNameValid = true;
      projectInfo.projectName = this.projectName;
    }

    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      choices: [
        { name: '项目', value: 'project' },
        { name: '组件', value: 'component' },
      ],
      default: 'project',
      message: '请选择初始化类型',
    });

    const title = type === 'project' ? '项目' : '组件';
    const projectNamePrompt = {
      type: 'input',
      name: 'projectName',
      message: `请输入${title}名称`,
      default: '',
      validate: function (v) {
        const done = this.async();
        setTimeout(function () {
          // 1.首字符必须为英文字符
          // 2.尾字符必须为英文或数字，不能为字符
          // 3.字符仅允许"-_"
          if (!isValidName(v)) {
            done(`请输入合法的${title}名称`);
            return;
          }
          done(null, true);
        }, 0);
      },
      filter: function (v) {
        return v;
      },
    };
    const projectPrompt = [];
    if (!isProjectNameValid) {
      projectPrompt.push(projectNamePrompt);
    }
    projectPrompt.push(
      {
        type: 'input',
        name: 'projectVersion',
        message: `请输入${title}版本号`,
        default: '1.0.0',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!!!semver.valid(v)) {
              done('请输入合法的版本号');
              return;
            }
            done(null, true);
          }, 0);
        },
        filter: function (v) {
          if (!!semver.valid(v)) {
            return semver.valid(v);
          } else {
            return v;
          }
        },
      },
      {
        type: 'list',
        name: 'projectTemplate',
        message: `请选择${title}模板`,
        choices: TEMPLATE_LIST.filter(i => i.tag.includes(type)),
      },
    );
    if (type === 'project') {
      // 2. 获取项目的基本信息
      const project = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...project,
      };
    } else if (type === 'component') {
      const descriptionPrompt = {
        type: 'input',
        name: 'componentDescription',
        message: '请输入组件描述信息',
        default: '',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!v) {
              done('请输入组件描述信息');
              return;
            }
            done(null, true);
          }, 0);
        },
      };
      projectPrompt.push(descriptionPrompt);
      // 2. 获取组件的基本信息
      const component = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...component,
      };
    }
    if (projectInfo.projectName) {
      projectInfo.name = projectInfo.projectName;
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.projectVersion;
    }
    return projectInfo;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
