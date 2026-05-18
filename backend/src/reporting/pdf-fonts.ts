import { existsSync } from 'fs';
import { join } from 'path';

const FONT_CANDIDATES = [
  join(process.cwd(), 'node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf'),
  join(process.cwd(), 'assets/fonts/DejaVuSans.ttf'),
  join(__dirname, '../../assets/fonts/DejaVuSans.ttf'),
  join(__dirname, '../../../assets/fonts/DejaVuSans.ttf'),
];

export function resolvePdfFontPath(): string | null {
  for (const candidate of FONT_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}
