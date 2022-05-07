// 模板列表
const TEMPLATE_LIST = [
  {
    value: 'wind-template-react',
    name: 'react标准模板',
    version: '1.3.0',
    type: 'normal',
    ignore: ['**/public/**'],
    installCmd: 'npm install',
    startCmd: 'npm start',
  },
  {
    value: 'wind-template-vue',
    name: 'vue标准模板',
    version: '1.2.0',
    type: 'normal',
    ignore: ['**/public/**'],
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
