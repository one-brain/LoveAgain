// @ts-ignore
import * as PretextModule from './pretext.js';

export interface PreparedHandle {
  widths: number[];
  kinds: string[];
  chunks: any[];
}

export interface LayoutResult {
  lineCount: number;
  height: number;
}

export const prepare = PretextModule.prepare as (text: string, font: string) => PreparedHandle;
export const layout = PretextModule.layout as (prepared: PreparedHandle, maxWidth: number, lineHeight: number) => LayoutResult;
export const prepareWithSegments = PretextModule.prepareWithSegments as (text: string, font: string) => any;
export const walkLineRanges = PretextModule.walkLineRanges as (segs: any, maxWidth: number, onLine: (line: { width: number }) => void) => number;
export const layoutWithLines = PretextModule.layoutWithLines as (segs: any, maxWidth: number, lineHeight: number) => { lineCount: number; height: number; lines: Array<{ text: string; width: number }> };
export const clearCache = PretextModule.clearCache as () => void;
