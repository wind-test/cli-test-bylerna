#!/usr/bin/env node

// 引入yargs及其他依赖模块
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const dedent = require("dedent");
const log = require("npmlog");
const utils = require("@wind-webcli/utils");
const pkg = require("./package.json");

// 解析参数
const argv = hideBin(process.argv)
// const cli = yargs(argv)

// 使用parse就解析参数了，就按照如下这样做
const context = {
  testVersion: pkg.version,
};
const cli = yargs()

// 调用 yargs 构造函数 传入一个参数进行解析  然后调用 argv  完成初始化过程
yargs(argv)
  .usage("Usage: $0 <command> [options]")
  .demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
  .recommendCommands()
  .strict()
  .fail((msg, err) => {
    // certain yargs validations throw strings :P
    const actual = err || new Error(msg);

    // ValidationErrors are already logged, as are package errors
    if (actual.name !== "ValidationError" && !actual.pkg) {
      // the recommendCommands() message is too terse
      if (/Did you mean/.test(actual.message)) {
        log.error("cli-test", `Unknown command "${cli.parsed.argv._[0]}"`);
      }

      log.error("cli-test", actual.message);
    }

    // exit non-zero so the CLI can be usefully chained
    cli.exit(actual.exitCode > 0 ? actual.exitCode : 1, actual);
  })
  .alias("h", "help")
  .alias("v", "version")
  .option("registry", {
    type: 'string',
    describe: "define global registry",
    alias: "r"
    // hidden：true
  })
  .command(
    "init [name]",
    "to init a project",
    (yargs) => {
      yargs.option("name", {
        type: "string",
        describe: 'name of a project',
        alias: "n"
      })
    },
    (argv) => {
      console.log('🚀🚀the project name is:', argv.name);
    }
  )  // command接收四个参数
  .command({
    command: "add",
    aliases: ["a", "ad"],
    describe: "add two number",
    builder: (yargs) => {
      yargs.options({
        one: {
          type: 'number',
          describe: "number to be added",
        },
        two: {
          type: 'number',
          describe: "number to be added",
        }
      })
    },
    handler: (argv) => { 
      if (!argv.one || !argv.two) {
        console.log("please input two number to add")
      } else {
        console.log(`${argv.one} + ${argv.two} = `, utils.add(argv.one, argv.two))
      }
    }
  })  // command也支持对象的写法
  .wrap(cli.terminalWidth())
  .epilogue(dedent`
    When a command fails, all logs are written to lerna-debug.log in the current working directory.

    For more information, find our manual at https://github.com/lerna/lerna
  `)
  // .argv  // 使用cli解析argv
  .parse(argv, context)   // 使用parse解析参数
