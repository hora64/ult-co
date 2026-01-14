import { enUS } from './en-US.js';
import { esES } from './es-ES.js';
import { frFR } from './fr-FR.js';
import { jaJP } from './ja-JP.js';
import { zhHansCN } from './zh-Hans-CN.js';
import { zhHant } from './zh-Hant.js';

export function getOCCXWeek15Info(languageCode) {
  switch (languageCode) {
    case 'en-US':
      return enUS;
    case 'es-ES':
      return esES;
    case 'fr-FR':
      return frFR;
    case 'ja-JP':
      return jaJP;
    case 'zh-Hans-CN':
      return zhHansCN;
    case 'zh-Hant':
      return zhHant;
    default:
      return enUS;
  }
}
