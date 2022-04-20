#!/usr/bin/env node

const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用cli-test-bylerna本地版本');
} else {
  // require('../lib/commander'); // 测试commander搭建的脚手架
  require('../lib')();
}
