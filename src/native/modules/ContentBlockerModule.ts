import {NativeModules} from 'react-native';

interface ContentBlockerModuleType {
  checkExtensionEnabled(bundleIdentifier: string): Promise<boolean>;
}

export default (NativeModules as {ContentBlockerModule: ContentBlockerModuleType})
  .ContentBlockerModule;
