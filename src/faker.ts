import type { LocaleDefinition } from './definitions';
import { FakerError } from './errors/faker-error';
import { deprecated } from './internal/deprecated';
import type { Mersenne } from './internal/mersenne/mersenne';
import mersenne from './internal/mersenne/mersenne';
import type { KnownLocale } from './locales';
import { AnimalModule } from './modules/animal';
import { ColorModule } from './modules/color';
import { CommerceModule } from './modules/commerce';
import { CompanyModule } from './modules/company';
import { DatabaseModule } from './modules/database';
import { DatatypeModule } from './modules/datatype';
import { DateModule } from './modules/date';
import { FinanceModule } from './modules/finance';
import { GitModule } from './modules/git';
import { HackerModule } from './modules/hacker';
import { HelpersModule } from './modules/helpers';
import { ImageModule } from './modules/image';
import { InternetModule } from './modules/internet';
import type { LocationModule as AddressModule } from './modules/location';
import { LocationModule } from './modules/location';
import { LoremModule } from './modules/lorem';
import { MusicModule } from './modules/music';
import { NumberModule } from './modules/number';
import type { PersonModule as NameModule } from './modules/person';
import { PersonModule } from './modules/person';
import { PhoneModule } from './modules/phone';
import { RandomModule } from './modules/random';
import { ScienceModule } from './modules/science';
import { StringModule } from './modules/string';
import { SystemModule } from './modules/system';
import { VehicleModule } from './modules/vehicle';
import { WordModule } from './modules/word';
import type { LiteralUnion } from './utils/types';

export type UsableLocale = LiteralUnion<KnownLocale>;
export type UsedLocales = Partial<Record<UsableLocale, LocaleDefinition>>;

export interface FakerOptions {
  locales: UsedLocales;
  locale?: UsableLocale;
  localeFallback?: UsableLocale;
  seed?: number;
  /** @internal */
  mersenne?: Mersenne;
}

const metadataKeys: ReadonlyArray<keyof LocaleDefinition> = ['title'];

export class Faker {
  locales: UsedLocales;
  private _locale: UsableLocale;
  private _localeFallback: UsableLocale;
  private _defaultRefDate: () => Date = () => new Date();

  get locale(): UsableLocale {
    return this._locale;
  }

  set locale(locale: UsableLocale) {
    if (!this.locales[locale]) {
      throw new FakerError(
        `Locale ${locale} is not supported. You might want to add the requested locale first to \`faker.locales\`.`
      );
    }

    this._locale = locale;
  }

  get localeFallback(): UsableLocale {
    return this._localeFallback;
  }

  set localeFallback(localeFallback: UsableLocale) {
    if (!this.locales[localeFallback]) {
      throw new FakerError(
        `Locale ${localeFallback} is not supported. You might want to add the requested locale first to \`faker.locales\`.`
      );
    }

    this._localeFallback = localeFallback;
  }

  /**
   * Gets a new reference date used to generate relative dates.
   */
  get defaultRefDate(): () => Date {
    return this._defaultRefDate;
  }

  /**
   * Sets the `refDate` source to use if no `refDate` date is passed to the date methods.
   *
   * @param dateOrSource The function or the static value used to generate the `refDate` date instance.
   * The function must return a new valid `Date` instance for every call.
   * Defaults to `() => new Date()`.
   */
  setDefaultRefDate(
    dateOrSource: string | Date | number | (() => Date) = () => new Date()
  ): void {
    if (typeof dateOrSource === 'function') {
      this._defaultRefDate = dateOrSource;
    } else {
      this._defaultRefDate = () => new Date(dateOrSource);
    }
  }

  readonly definitions: LocaleDefinition = this.initDefinitions();

  /** @internal */
  private readonly _mersenne: Mersenne;

  readonly random: RandomModule = new RandomModule(this);

  readonly helpers: HelpersModule = new HelpersModule(this);

  readonly datatype: DatatypeModule = new DatatypeModule(this);

  readonly animal: AnimalModule = new AnimalModule(this);
  readonly color: ColorModule = new ColorModule(this);
  readonly commerce: CommerceModule = new CommerceModule(this);
  readonly company: CompanyModule = new CompanyModule(this);
  readonly database: DatabaseModule = new DatabaseModule(this);
  readonly date: DateModule = new DateModule(this);
  readonly finance = new FinanceModule(this);
  readonly git: GitModule = new GitModule(this);
  readonly hacker: HackerModule = new HackerModule(this);
  readonly image: ImageModule = new ImageModule(this);
  readonly internet: InternetModule = new InternetModule(this);
  readonly location: LocationModule = new LocationModule(this);
  readonly lorem: LoremModule = new LoremModule(this);
  readonly music: MusicModule = new MusicModule(this);
  readonly person: PersonModule = new PersonModule(this);
  readonly number: NumberModule = new NumberModule(this);
  readonly phone: PhoneModule = new PhoneModule(this);
  readonly science: ScienceModule = new ScienceModule(this);
  readonly string: StringModule = new StringModule(this);
  readonly system: SystemModule = new SystemModule(this);
  readonly vehicle: VehicleModule = new VehicleModule(this);
  readonly word: WordModule = new WordModule(this);

  // Aliases
  /** @deprecated Use {@link location} instead */
  get address(): AddressModule {
    deprecated({
      deprecated: 'faker.address',
      proposed: 'faker.location',
      since: '8.0',
      until: '10.0',
    });
    return this.location;
  }

  /** @deprecated Use {@link person} instead */
  get name(): NameModule {
    deprecated({
      deprecated: 'faker.name',
      proposed: 'faker.person',
      since: '8.0',
      until: '10.0',
    });
    return this.person;
  }

  constructor(opts: FakerOptions) {
    if (!opts) {
      throw new FakerError(
        'Options with at least one entry in locales must be provided'
      );
    }

    if (Object.keys(opts.locales ?? {}).length === 0) {
      throw new FakerError(
        'At least one entry in locales must be provided in the locales parameter'
      );
    }

    this.locales = opts.locales;
    this.locale = opts.locale || 'en';
    this.localeFallback = opts.localeFallback || 'en';
    this._mersenne = opts.mersenne ?? mersenne();
    if (opts.seed != null) {
      this.seed(opts.seed);
    }
  }

  /**
   * Creates a Proxy based LocaleDefinition that virtually merges the locales.
   */
  private initDefinitions(): LocaleDefinition {
    // Returns the first LocaleDefinition[key] in any locale
    const resolveBaseData = (key: keyof LocaleDefinition): unknown =>
      this.locales[this.locale][key] ?? this.locales[this.localeFallback][key];

    // Returns the first LocaleDefinition[module][entry] in any locale
    const resolveModuleData = (
      module: keyof LocaleDefinition,
      entry: string
    ): unknown =>
      this.locales[this.locale][module]?.[entry] ??
      this.locales[this.localeFallback][module]?.[entry];

    // Returns a proxy that can return the entries for a module (if it exists)
    const moduleLoader = (
      module: keyof LocaleDefinition
    ): Record<string, unknown> | undefined => {
      if (resolveBaseData(module)) {
        return new Proxy(
          {},
          {
            get(target, entry: string): unknown {
              return resolveModuleData(module, entry);
            },
          }
        );
      } else {
        return undefined;
      }
    };

    return new Proxy({} as LocaleDefinition, {
      get(target: LocaleDefinition, module: string): unknown {
        // Support aliases
        if (module === 'address') {
          module = 'location';
          deprecated({
            deprecated: `faker.helpers.fake('{{address.*}}') or faker.definitions.address`,
            proposed: `faker.helpers.fake('{{location.*}}') or faker.definitions.location`,
            since: '8.0',
            until: '10.0',
          });
        } else if (module === 'name') {
          module = 'person';
          deprecated({
            deprecated: `faker.helpers.fake('{{name.*}}') or faker.definitions.name`,
            proposed: `faker.helpers.fake('{{person.*}}') or faker.definitions.person`,
            since: '8.0',
            until: '10.0',
          });
        }

        let result = target[module];
        if (result) {
          return result;
        } else if (metadataKeys.includes(module)) {
          return resolveBaseData(module);
        } else {
          result = moduleLoader(module);
          target[module] = result;
          return result;
        }
      },
    });
  }

  /**
   * Sets the seed or generates a new one.
   *
   * Please note that generated values are dependent on both the seed and the
   * number of calls that have been made since it was set.
   *
   * This method is intended to allow for consistent values in a tests, so you
   * might want to use hardcoded values as the seed.
   *
   * In addition to that it can be used for creating truly random tests
   * (by passing no arguments), that still can be reproduced if needed,
   * by logging the result and explicitly setting it if needed.
   *
   * @param seed The seed to use. Defaults to a random number.
   * @returns The seed that was set.
   *
   * @example
   * // Consistent values for tests:
   * faker.seed(42)
   * faker.number.int(10); // 4
   * faker.number.int(10); // 8
   *
   * faker.seed(42)
   * faker.number.int(10); // 4
   * faker.number.int(10); // 8
   *
   * @example
   * // Random but reproducible tests:
   * // Simply log the seed, and if you need to reproduce it, insert the seed here
   * console.log('Running test with seed:', faker.seed());
   */
  seed(seed?: number): number;
  /**
   * Sets the seed array.
   *
   * Please note that generated values are dependent on both the seed and the
   * number of calls that have been made since it was set.
   *
   * This method is intended to allow for consistent values in a tests, so you
   * might want to use hardcoded values as the seed.
   *
   * In addition to that it can be used for creating truly random tests
   * (by passing no arguments), that still can be reproduced if needed,
   * by logging the result and explicitly setting it if needed.
   *
   * @param seedArray The seed array to use.
   * @returns The seed array that was set.
   *
   * @example
   * // Consistent values for tests:
   * faker.seed([42, 13, 17])
   * faker.number.int(10); // 4
   * faker.number.int(10); // 8
   *
   * faker.seed([42, 13, 17])
   * faker.number.int(10); // 4
   * faker.number.int(10); // 8
   *
   * @example
   * // Random but reproducible tests:
   * // Simply log the seed, and if you need to reproduce it, insert the seed here
   * console.log('Running test with seed:', faker.seed());
   */
  seed(seedArray: number[]): number[];
  seed(
    seed: number | number[] = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER)
  ): number | number[] {
    this._mersenne.seed(seed);

    return seed;
  }

  /**
   * Set Faker's locale
   *
   * @param locale The locale to set (e.g. `en` or `en_AU`, `en_AU_ocker`).
   */
  setLocale(locale: UsableLocale): void {
    this.locale = locale;
  }

  /**
   * Clones this faker instance including the current seed.
   * This method is idempotent and does not consume any seed values.
   * The forked instance will produce the same values as the original given that the methods are called in the same order.
   *
   * @see faker.derive If you want to generate deterministic but different values.
   *
   * @example
   * faker.seed(42);
   * faker.fork().person.firstName(); // 'Lavina' (1st call)
   * faker.fork().person.firstName(); // 'Lavina' (1st call)
   * faker.person.firstName(); // 'Lavina' (1st call)
   */
  fork(): Faker {
    return new Faker({
      locale: this.locale,
      localeFallback: this.localeFallback,
      locales: this.locales,
      mersenne: this._mersenne.fork(),
    });
  }

  /**
   * Derives a new Faker instance from the current one.
   * This will consume a single value from the original instance to initialize the seed of the derived new instance, thus has an impact on subsequent calls.
   * The derived instance can be used to generate deterministic values based on the current seed without consuming a dynamic amount of seed values.
   * This is useful, if you wish to generate a complex object (e.g. a Person) and might want to add a property to it later.
   * If the Person is created from a derived instance, then adding or removing properties from the Person doesn't have any impact on the other data, generated using the original instance (except from the derive call itself).
   *
   * @see faker.fork If you want to create an exact clone of this faker instance without consuming a seed value.
   *
   * @example
   * faker.seed(42);
   * faker.number.int(10); // 4 (1st call)
   * faker.number.int(10); // 8 (2nd call)
   * faker.seed(42);
   * const derived = faker.derive(); // (1st call)
   * const firstName = derived.person.firstName(); // 'Lavina'
   * const lastName = derived.person.lastName(); // 'Kuhic'
   * // It doesn't matter how many calls to derived are executed
   * faker.number.int(10); // 8 (2nd call) <- This is same as before
   */
  derive(): Faker {
    return new Faker({
      locale: this.locale,
      localeFallback: this.localeFallback,
      locales: this.locales,
      seed: this._mersenne.next({ min: 0, max: Number.MAX_SAFE_INTEGER }),
    });
  }
}
