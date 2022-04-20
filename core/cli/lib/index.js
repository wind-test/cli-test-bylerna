module.exports = core;

const constants = require('./const');
const semver = require('semver');
const colors = require('colors');
const pkg = require('../package.json');
const log = require('@wind-webcli/log');
const userHome = require('user-home'); //获取当前用户主目录
const pathExists = require('path-exists').sync;
const path = require('path');
const { Command } = require('commander');

const program = new Command();

async function core() {
  checkPkgVersion();
  checkNodeVersion();
  await checkGlobalUpdate();
  checkRoot();
  checkUserHone();
  // checkInputArgs();
  checkEnv();
  registerCommand();
}

// 注册命令
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-r, --register <register>', '下载模块使用的镜像源', 'https://registry.npmjs.org' )

  program
    .command('init [projectName]')
    .description('初始化一个项目')
    .option('-f, --force', '是否强制初始化该项目', false)
    .action((projectName) => {
      log.info('正在初始化项目...项目名称是：', projectName);
    });

  program.on('option:debug', function () {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = 'verbose';
      log.info('已开启调试模式');
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.LOG_LEVEL = process.env.LOG_LEVEL;
  });

  program.on('command:*', function (cmdObj) {
    log.error('未知的命令：', cmdObj[0]);
    const availableCommands = program.commands.map(cmd => cmd.name())
    log.info('可用的命令：', availableCommands.join())
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    // 如果没有输入命令,则打印帮助信息
    program.outputHelp();
    console.log();
  }
}

// 检查当前脚手架版本号
function checkPkgVersion() {
  log.info('cli当前版本是', pkg.version);
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
    log.info('用户主目录', userHome);
  }
}

// // 检查入参
// function checkInputArgs() {
//   const minimist = require('minimist'); //获取入口参数
//   const args = minimist(process.argv.slice(2));
//   checkArgs(args);
//   log.verbose('你看到这条说明已开启debug模式');
// }

// // 判断是否为debug模式
// function checkArgs(args) {
//   if (args.debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   } else {
//     process.env.LOG_LEVEL = 'info';
//   }
//   log.level = process.env.LOG_LEVEL;
// }

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv'); //获取环境变量
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  log.verbose('process.env携带的环境：', process.env.CLI_HOME_PATH);
}

// 创建默认的环境变量
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查是否最新版本
async function checkGlobalUpdate() {
  //1.获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  //2.调用npm API,获取所有版本号
  const { getNpmSemverVersion } = require('@wind-webcli/get-npm-info');
  //3.提取所有版本号，比对哪些版本号是大于当前版本号
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    //4.获取最新的版本号，提示用户更新到该版本
    log.warn(
      colors.yellow(
        `请手动更新${npmName},当前版本:${currentVersion},最新版本:${lastVersion} 更新命令:npm install -g ${npmName}`,
      ),
    );
  }
}
