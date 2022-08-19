/*
 * This file is automatically generated.
 * Run 'pnpm run generate:locales' to update.
 */

import { Faker } from '../faker';
import az from '../locales/az.json';
import en from '../locales/en.json';

export const faker = new Faker({
  locale: 'az',
  localeFallback: 'en',
  locales: {
    az,
    en,
  },
});
