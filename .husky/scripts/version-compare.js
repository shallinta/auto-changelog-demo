function compareVersion(ver1, ver2) {
  const ver1Arr = ver1.split('.');
  const ver2Arr = ver2.split('.');
  let i = 0;
  while (i < 3) {
    const version1 = parseInt(ver1Arr[i]);
    const version2 = parseInt(ver2Arr[i]);

    if (version2 > version1) {
      return true;
    } else if (version2 < version1) {
      return false;
    }
    i += 1;
  }
  return false;
}

module.exports = compareVersion;
