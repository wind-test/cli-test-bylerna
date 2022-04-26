'use strict';

const Command = require('@wind-webcli/command');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const log = require('@wind-webcli/log');
const semver = require('semver');
class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0]; // 项目名称
    this.options = this._argv[1]; // 参数选项
    this.force = this.options.force; // 是否强制清空当前目录
    log.verbose('projectName', this.projectName);
    log.verbose('force', this.force);
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
    const projectInfo = await this.getProjectInfo();
    log.verbose('填写的项目信息为：', JSON.stringify(projectInfo));
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
        choices: this.getTemplateChoice(),
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
    return projectInfo;
  }

  // 获取项目模板选项
  getTemplateChoice() {
    return [
      { value: '@wind-template/react', name: 'react标准模板' },
      { value: '@wind-template/koa', name: 'koa标准模板' },
      { value: '@wind-template/vue', name: 'vue标准模板' },
    ];
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
