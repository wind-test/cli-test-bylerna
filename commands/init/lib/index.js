'use strict';

module.exports = init;

/**
 *
 * @param {String} projectName 初始化的项目名称
 * @param {[object Object]} options 初始化的参数选项
 * @param {[object Object]} command 命令对象本身
 */
function init(projectName, options, command) {
  // 第一个参数为该条命令名后跟的参数值
  console.log('该条命令后跟的参数值是：', projectName);
  // 第二个参数为该条命令其它参数选项，不包括全局参数选项
  console.log('该条命令的其它参数选项：', options);
  // 第三个参数为命令对象本身，通过parent.opts可以获取全局参数选项
  console.log('命令的全局参数选项：', command.parent.opts());
  // 通过监听全局参数选项，将其挂载进程上，可以实现与上述相同的效果
  console.log('命令的全局参数选项- targetPath：', process.env.CLI_TARGET_PATH);
}
