// 模板列表
const TEMPLATE_LIST = [
  {
    value: 'wind-template-react',
    name: 'react标准模板',
    version: '1.3.0',
    type: 'normal',
    tag: ['project'],
    ignore: ['**/public/**'],
    installCmd: 'npm install',
    startCmd: 'npm start',
  },
  {
    value: 'wind-template-vue',
    name: 'vue标准模板',
    version: '1.2.0',
    type: 'normal',
    tag: ['project'],
    ignore: ['**/public/**'],
    installCmd: 'npm install',
    startCmd: 'npm start',
  },
  {
    value: 'wind-template-components',
    name: '组件库标准模板',
    version: '1.0.0',
    type: 'normal',
    tag: ['component'],
    ignore: ['**/public/**', "**.png"],
    installCmd: 'npm install',
    startCmd: 'npm start',
  },
];

// 模板脚本白名单
const WHITELIST_CMD = ['npm', 'cnpm'];

module.exports = {
  TEMPLATE_LIST,
  WHITELIST_CMD,
};
