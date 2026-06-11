import {useCallback} from 'react';
import ContentBlockerModule from '../../../native/modules/ContentBlockerModule';

const EXTENSION_BUNDLE_ID =
  'com.nonstandardlogic.oneBlocker.ContentBlockerExtension';

export function useExtensionStatus() {
  const checkEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await ContentBlockerModule.checkExtensionEnabled(
        EXTENSION_BUNDLE_ID,
      );
    } catch (_e) {
      return false;
    }
  }, []);

  return {checkEnabled};
}
