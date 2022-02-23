/**
 * Getting version value at pacakge.json of remote repository syncronous,
 * and the result is directly printed out for the use of generating changelog.
 *
 * Used at the `prebump` hook of `standard-version`.
 */

const execSync = require('child_process').execSync;
const fse = require('fs-extra');
const path = require('path');
const compareVersion = require('./version-compare');

const localVersion = require('../../package.json').version;

const logs = [];
logs.push('Cwd: ' + process.cwd());
logs.push('Local version : ' + localVersion);

const SHELL_STDIO_SILENT = { stdio: 'pipe', encoding: 'utf-8' };

let stashRes;

try {
  const br = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', }).trim();
  logs.push('Current Branch : ' + br);

  stashRes = execSync('git stash', SHELL_STDIO_SILENT).trim();
  logs.push('Git stash : ' + stashRes);

  const checkoutOriginPkgRes = execSync(`git checkout origin/${br} package.json`, SHELL_STDIO_SILENT);
  logs.push('Checkout origin package.json : ' + checkoutOriginPkgRes);
} catch (ex) {
  logs.push('报错[1] : ' + ex.toString());
}

let originVersion;

try {
  const pkgFilePath = path.resolve(__dirname, '../../package.json');
  originVersion = execSync(`awk -F \\" '/\"version\":/ {print $4}' ${pkgFilePath}`, SHELL_STDIO_SILENT).trim();
  logs.push('Origin version : ' + originVersion);

  const commitId = execSync('git rev-parse HEAD', SHELL_STDIO_SILENT).trim();
  logs.push('Commit id : ', commitId);
  const checkoutCommitPkgRes = execSync(`git checkout ${commitId} -- package.json`, SHELL_STDIO_SILENT);
  logs.push('Checkout commit package.json : ', checkoutCommitPkgRes);

  const NO_LOCAL_CHANGES = 'No local changes to save';
  if (NO_LOCAL_CHANGES !== stashRes) {
    const stashPopRes = execSync('git stash pop', SHELL_STDIO_SILENT);
    logs.push('Git stash pop : ' + stashPopRes);
  }

} catch(ex) {
  logs.push('报错[2] : ' + ex.toString());
} finally {
  // 如果本地版本已经更新为超过线上版本，则继续使用当前本地版本号
  if (compareVersion(originVersion, localVersion)) {
    console.log(localVersion);
    logs.push('Result : ' + localVersion);
  }

  const datetime = new Date().toLocaleString('chinese', { hour12: false }).replace(/[ /:]/g, '.');
  fse.ensureDirSync(path.resolve(__dirname, 'logs'));
  fse.writeFileSync(path.resolve(__dirname, `logs/debug-${datetime}.log`), logs.join('\n'), { encoding: 'utf-8' });
}
