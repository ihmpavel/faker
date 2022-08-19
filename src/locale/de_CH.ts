/*
 * This file is automatically generated.
 * Run 'pnpm run generate:locales' to update.
 */

import { Faker } from '../faker';
import de_CH from '../locales/de_CH.json';
import en from '../locales/en.json';

export const faker = new Faker({
  locale: 'de_CH',
  localeFallback: 'en',
  locales: {
    de_CH,
    en,
  },
});
