/*
 * This file is automatically generated.
 * Run 'pnpm run generate:locales' to update.
 */

import { Faker } from '../faker';
import en from '../locales/en.json';
import ur from '../locales/ur.json';

export const faker = new Faker({
  locale: 'ur',
  localeFallback: 'en',
  locales: {
    ur,
    en,
  },
});
