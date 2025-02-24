/* eslint-disable @typescript-eslint/no-explicit-any */

import { atom } from 'jotai/vanilla';
import type { Atom, SetStateAction, WritableAtom } from 'jotai/vanilla';
import * as O from 'optics-ts';

const getCached = <T>(c: () => T, m: WeakMap<object, T>, k: object): T =>
  (m.has(k) ? m : m.set(k, c())).get(k) as T;
const cache1 = new WeakMap();
const memo2 = <T>(create: () => T, dep1: object, dep2: object): T => {
  const cache2 = getCached(() => new WeakMap(), cache1, dep1);
  return getCached(create, cache2, dep2);
};

const isFunction = <T>(x: T): x is T & ((...args: any[]) => any) =>
  typeof x === 'function';

type NonFunction<T> = [T] extends [(...args: any[]) => any] ? never : T;

type ModifiableLensLike<S, A> =
  | O.Lens<S, any, A>
  | O.Equivalence<S, any, A>
  | O.Iso<S, any, A>
  | O.Prism<S, any, A>
  | O.Traversal<S, any, A>;

type SettableLensLike<S, A> = ModifiableLensLike<S, A> | O.Setter<S, any, A>;

type LensLike<S, A> =
  | SettableLensLike<S, A>
  | O.Getter<S, A>
  | O.AffineFold<S, A>
  | O.Fold<S, A>;

// Pattern 1: Promise

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Prism<S, any, A>,
): WritableAtom<Promise<A | undefined>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Traversal<S, any, A>,
): WritableAtom<Promise<A[]>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (
    optic: O.OpticFor_<S>,
  ) => O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
): WritableAtom<Promise<A>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Setter<S, any, A>,
): WritableAtom<Promise<void>, [NonFunction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Getter<S, A>,
): Atom<Promise<A>>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.AffineFold<S, A>,
): Atom<Promise<A | undefined>>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Fold<S, A>,
): Atom<Promise<A[]>>;

// Pattern 2: Promise with undefined type

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Prism<S, any, A>,
): WritableAtom<Promise<A | undefined>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Traversal<S, any, A>,
): WritableAtom<Promise<A[]>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (
    optic: O.OpticFor_<S | undefined>,
  ) => O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
): WritableAtom<Promise<A>, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Setter<S, any, A>,
): WritableAtom<Promise<void>, [NonFunction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Getter<S, A>,
): Atom<Promise<A>>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.AffineFold<S, A>,
): Atom<Promise<A | undefined>>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<Promise<S | undefined>, [Promise<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Fold<S, A>,
): Atom<Promise<A[]>>;

// Pattern 3: Default

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Prism<S, any, A>,
): WritableAtom<A | undefined, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Traversal<S, any, A>,
): WritableAtom<A[], [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (
    optic: O.OpticFor_<S>,
  ) => O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
): WritableAtom<A, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Setter<S, any, A>,
): WritableAtom<void, [NonFunction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Getter<S, A>,
): Atom<A>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.AffineFold<S, A>,
): Atom<A | undefined>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => O.Fold<S, A>,
): Atom<A[]>;

// Pattern 4: Default with undefined type

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Prism<S, any, A>,
): WritableAtom<A | undefined, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Traversal<S, any, A>,
): WritableAtom<A[], [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (
    optic: O.OpticFor_<S | undefined>,
  ) => O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
): WritableAtom<A, [SetStateAction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Setter<S, any, A>,
): WritableAtom<void, [NonFunction<A>], R>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Getter<S, A>,
): Atom<A>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.AffineFold<S, A>,
): Atom<A | undefined>;

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S | undefined, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S | undefined>) => O.Fold<S, A>,
): Atom<A[]>;

// Implementation

export function focusAtom<S, A, R>(
  baseAtom: WritableAtom<S, [NonFunction<S>], R>,
  callback: (optic: O.OpticFor_<S>) => LensLike<S, A>,
) {
  return memo2(
    () => {
      const focus = callback(O.optic<S>());
      const derivedAtom = atom(
        (get) => {
          const base = get(baseAtom);
          return base instanceof Promise
            ? base.then((v) => getValueUsingOptic(focus, v))
            : getValueUsingOptic(focus, base);
        },
        (get, set, update: SetStateAction<A>) => {
          const newValueProducer = isFunction(update)
            ? O.modify(focus as ModifiableLensLike<S, A>)(update)
            : O.set(focus as SettableLensLike<S, A>)(update);
          const base = get(baseAtom);
          return set(
            baseAtom,
            (base instanceof Promise
              ? base.then(newValueProducer)
              : newValueProducer(base)) as NonFunction<S>,
          );
        },
      );
      return derivedAtom;
    },
    baseAtom,
    callback,
  );
}

const getValueUsingOptic = <S, A>(focus: LensLike<S, A>, bigValue: S) => {
  if (focus._tag === 'Traversal' || focus._tag === 'Fold') {
    const values = O.collect(focus)(bigValue);
    return values;
  }
  if (focus._tag === 'Prism' || focus._tag === 'AffineFold') {
    const value = O.preview(focus)(bigValue);
    return value;
  }
  if (focus._tag === 'Setter') {
    return undefined;
  }
  const value = O.get(focus)(bigValue);
  return value;
};
