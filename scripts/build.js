const fs = require('fs');
const path = require('path');

/**
 * 微信小程序插件构建脚本
 * 将 src 目录下的文件复制到 lib 目录
 */

const srcDir = path.join(__dirname, '../src');
const libDir = path.join(__dirname, '../lib');

// 确保 lib 目录存在
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// 复制文件
function copyFile(src, dest) {
  const content = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, content);
  console.log(`Copied: ${src} -> ${dest}`);
}

// 复制所有源文件
const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(libDir, file);
  
  if (fs.statSync(srcFile).isFile()) {
    copyFile(srcFile, destFile);
  }
});

console.log('Build completed successfully!');