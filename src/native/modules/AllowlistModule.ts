import {NativeModules} from 'react-native';

interface AllowlistModuleType {
  addDomain(domain: string): Promise<void>;
  removeDomain(domain: string): Promise<void>;
  getAllDomains(): Promise<string[]>;
}

const native = (
  NativeModules as {AllowlistModule?: AllowlistModuleType}
).AllowlistModule;

export default {
  async addDomain(domain: string): Promise<void> {
    if (native?.addDomain) {
      return native.addDomain(domain);
    }
  },
  async removeDomain(domain: string): Promise<void> {
    if (native?.removeDomain) {
      return native.removeDomain(domain);
    }
  },
  async getAllDomains(): Promise<string[]> {
    if (native?.getAllDomains) {
      return native.getAllDomains();
    }
    return [];
  },
};
