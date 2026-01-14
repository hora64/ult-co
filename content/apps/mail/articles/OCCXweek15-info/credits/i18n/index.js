import { enUS } from './en-US.js';
import { deDE } from './de-DE.js';
import { esES } from './es-ES.js';
import { frFR } from './fr-FR.js';
import { jaJP } from './ja-JP.js';
import { koKR } from './ko-KR.js';
import { ptBR } from './pt-BR.js';
import { zhHansCN } from './zh-Hans-CN.js';
import { zhHant } from './zh-Hant.js';
import { xPirate } from './x-pirate.js';
import { xUwu } from './x-uwu.js';
import { xValley } from './x-valley.js';
import { xDebugEnUS } from './x-debug-en-US.js';
import { xDebugZhHansCN } from './x-debug-zh-Hans-CN.js';

export function getOCCXWeek15InfoCredits(languageCode) {
  switch (languageCode) {
    case 'en-US':
      return enUS;
    case 'de-DE':
      return deDE;
    case 'es-ES':
      return esES;
    case 'fr-FR':
      return frFR;
    case 'ja-JP':
      return jaJP;
    case 'ko-KR':
      return koKR;
    case 'pt-BR':
      return ptBR;
    case 'zh-Hans-CN':
      return zhHansCN;
    case 'zh-Hant':
      return zhHant;
    case 'x-pirate':
      return xPirate;
    case 'x-uwu':
      return xUwu;
    case 'x-valley':
      return xValley;
    case 'x-debug-en-US':
      return xDebugEnUS;
    case 'x-debug-zh-Hans-CN':
      return xDebugZhHansCN;
    default:
      return enUS;
  }
}
