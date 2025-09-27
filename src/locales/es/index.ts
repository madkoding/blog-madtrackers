import { common } from './common';
import { hero } from './hero';
import { benefits } from './benefits';
import { product } from './product';
import { forms } from './forms';
import { tracking } from './tracking';
import { payment } from './payment';
import { shipping } from './shipping';
import { sensors } from './sensors';
import { trackers } from './trackers';
import { colors } from './colors';
import { dates } from './dates';
import { faq } from './faq';
import { maintenance } from './maintenance';

export const es = {
  ...common,
  ...hero,
  ...benefits,
  ...product,
  ...forms,
  ...tracking,
  ...payment,
  ...shipping,
  ...sensors,
  ...trackers,
  ...colors,
  ...dates,
  ...faq,
  ...maintenance,
} as const;
