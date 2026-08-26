import {keoTargetRoom} from './keo-target-room';

/**
 * Цель навигации вместе со своим помещением: секция внутри свёрнутого
 * помещения не видна, поэтому «Далее» всегда раскрывает пару.
 */
export function keoOpenWithRoom(target: string): Set<string> {
  const room = keoTargetRoom(target);

  return room === undefined ? new Set([target]) : new Set([room, target]);
}
