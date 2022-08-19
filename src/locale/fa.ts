/*
 * This file is automatically generated.
 * Run 'pnpm run generate:locales' to update.
 */

import { Faker } from '../faker';
import en from '../locales/en.json';
import fa from '../locales/fa.json';

export const faker = new Faker({
  locale: 'fa',
  localeFallback: 'en',
  locales: {
    fa,
    en,
  },
});
