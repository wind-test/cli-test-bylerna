const { Command } = require('commander');
const pkg = require('../package.json');

// 使用commander内置的单例模式
// const { program } = commander;

// 实例化一个commander实例（推荐使用）
const program = new Command();

program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启测试模式', false)
  .option('-e, --envName <envName>', '获取环境变量名称');

// commander 注册命令
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .option('-f, --force', '是否强制执行', false)
  .action((source, destination, cmdObj) => {
    console.log('clone params:', source, destination, cmdObj);
  });

// addCommand 注册子命令
const service = new Command('service');
service
  .command('start [port]')
  .description('start service at some port')
  .action((port) => {
    console.log('do service start', port);
  });
service
  .command('stop')
  .description('stop service')
  .action(() => {
    console.log('stop service');
  });

program.addCommand(service);

// cli-test install init -> cli-test-install init -> wind-test clone aaa
program
  .command('install [name]', 'install package', {
    executableFile: 'wind-test',
    // isDefault: true,
    hidden: false,
  })
  .alias('i');

program
  .arguments('<cmd> [options]')
  .description('test command', {
    cmd: 'command to run',
    options: 'options for command',
  })
  .action(function (cmd, options) {
    console.log(cmd, options);
  });

// 高级定制1：自定义help信息
// program.helpInformation = function () {
//   return '';
// };
// program.on('--help', function () {
//   console.log('your help information');
// });

// 高级定制2：监听参数值--实现debug模式
program.on('option:debug', function () {
  if (program.opts().debug) {
    process.env.LOG_LEVEL = 'verbose';
  }
  console.log(process.env.LOG_LEVEL);
});

// 高级定制3：对未知命令监听
program.on('command:*', function (obj) {
  // console.log(obj);
  console.error('未知的命令：' + obj[0]);
  const availableCommands = program.commands.map((cmd) => cmd.name());
  // console.log(availableCommands);
  console.log('可用命令：' + availableCommands.join(','));
});

program.parse(process.argv);
