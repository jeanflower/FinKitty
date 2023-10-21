import packageData from '../package.json';

export function getAppVersion(): string {
  return packageData.version;
}
