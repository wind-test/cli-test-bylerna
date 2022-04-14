module.exports = core

const constants = require('./const')
const semver = require('semver')
const colors = require("colors")
const pkg = require('../package.json');
const log = require('@wind-webcli/log')
const userHome = require('user-home');//获取当前用户主目录
const pathExists = require('path-exists').sync
const path = require('path')

let config;

async function core() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHone();
  checkInputArgs();
  checkEnv();
}

// 检查当前脚手架版本号
function checkPkgVersion(){
  log.info('cli当前版本是',pkg.version);
}

// 检查Node版本号
function checkNodeVersion() {
  //第一步，获取当前Node版本号
  const currentVersion = process.version;
  const lastVersion = constants.LOWEST_NODE_VERSION;
  //第二步，对比最低版本号
  if (!semver.gte(currentVersion, lastVersion)) {
    log.error(colors.red(`wind-webcli 需要安装v${lastVersion}以上版本的Node.js`));
  }
}

// 检查是否root启动
function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
}

//判断目录是否存在
function checkUserHone() {
  if (!userHome || !pathExists(userHome)) {
    log.error(colors.red('当前登录用户主目录不存在!!!'));
  } else {
    log.info('用户主目录', userHome)
  }
}

// 检查入参
function checkInputArgs() {
  const minimist = require('minimist'); //获取入口参数 
  const args = minimist(process.argv.slice(2)); 
  checkArgs(args);
  log.verbose('你看到这条说明已开启debug模式')
}

// 判断是否为debug模式
function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'; 
  } else {
    process.env.LOG_LEVEL = 'info';
  } 
  log.level = process.env.LOG_LEVEL; 
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv');//获取环境变量
  const dotenvPath = path.resolve(userHome,'.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path:dotenvPath
    });
  } 
  createDefaultConfig();
  log.verbose('process.env携带的环境：', process.env.CLI_HOME_PATH)
}

// 创建默认的环境变量
function createDefaultConfig(){
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome,process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome,constants.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}