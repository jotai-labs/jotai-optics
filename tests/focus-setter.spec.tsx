import { afterEach, test } from 'vitest';
import { StrictMode, Suspense } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtom, useSetAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import type { SetStateAction } from 'jotai/vanilla';
import * as O from 'optics-ts';
import { focusAtom } from 'jotai-optics';

afterEach(cleanup);

test('basic derivation using focus works', async () => {
  const bigAtom = atom([{ a: 0 }]);
  const focusFunction = (optic: O.OpticFor_<{ a: number }[]>) =>
    optic.appendTo();

  const Counter = () => {
    const appendNumber = useSetAtom(focusAtom(bigAtom, focusFunction));
    const [bigAtomValue] = useAtom(bigAtom);
    return (
      <>
        <div>bigAtom: {JSON.stringify(bigAtomValue)}</div>
        <button onClick={() => appendNumber({ a: bigAtomValue.length })}>
          Append to bigAtom
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(
    <StrictMode>
      <Counter />
    </StrictMode>,
  );

  await findByText('bigAtom: [{"a":0}]');

  fireEvent.click(getByText('Append to bigAtom'));
  await findByText('bigAtom: [{"a":0},{"a":1}]');

  fireEvent.click(getByText('Append to bigAtom'));
  await findByText('bigAtom: [{"a":0},{"a":1},{"a":2}]');
});

test('double-focus on an atom works', async () => {
  const bigAtom = atom({ a: [0] });
  const atomA = focusAtom(bigAtom, (optic) => optic.prop('a'));
  const atomAppend = focusAtom(atomA, (optic) => optic.appendTo());

  const Counter = () => {
    const [bigAtomValue, setBigAtom] = useAtom(bigAtom);
    const [atomAValue, setAtomA] = useAtom(atomA);
    const append = useSetAtom(atomAppend);
    return (
      <>
        <div>bigAtom: {JSON.stringify(bigAtomValue)}</div>
        <div>atomA: {JSON.stringify(atomAValue)}</div>
        <button onClick={() => setBigAtom((v) => ({ a: [...v.a, 1] }))}>
          inc bigAtom
        </button>
        <button onClick={() => setAtomA((v) => [...v, 2])}>inc atomA</button>
        <button onClick={() => append(3)}>append</button>
      </>
    );
  };

  const { getByText, findByText } = render(
    <StrictMode>
      <Counter />
    </StrictMode>,
  );

  await findByText('bigAtom: {"a":[0]}');
  await findByText('atomA: [0]');

  fireEvent.click(getByText('inc bigAtom'));
  await findByText('bigAtom: {"a":[0,1]}');
  await findByText('atomA: [0,1]');

  fireEvent.click(getByText('inc atomA'));
  await findByText('bigAtom: {"a":[0,1,2]}');
  await findByText('atomA: [0,1,2]');

  fireEvent.click(getByText('append'));
  await findByText('bigAtom: {"a":[0,1,2,3]}');
  await findByText('atomA: [0,1,2,3]');
});

test('focus on async atom works', async () => {
  const baseAtom = atom([0]);
  const asyncAtom = atom(
    (get) => Promise.resolve(get(baseAtom)),
    async (get, set, param: SetStateAction<Promise<number[]>>) => {
      const prev = Promise.resolve(get(baseAtom));
      const next = await (typeof param === 'function' ? param(prev) : param);
      set(baseAtom, next);
    },
  );
  const focusFunction = (optic: O.OpticFor_<number[]>) => optic.appendTo();

  const Counter = () => {
    const append = useSetAtom(focusAtom(asyncAtom, focusFunction));
    const [asyncValue, setAsync] = useAtom(asyncAtom);
    const [baseValue, setBase] = useAtom(baseAtom);
    return (
      <>
        <div>baseAtom: {JSON.stringify(baseValue)}</div>
        <div>asyncAtom: {JSON.stringify(asyncValue)}</div>
        <button onClick={() => append(baseValue.length)}>append</button>
        <button
          onClick={() => setAsync((p) => p.then((v) => [...v, v.length]))}
        >
          incr async
        </button>
        <button onClick={() => setBase((v) => [...v, v.length])}>
          incr base
        </button>
      </>
    );
  };

  const { getByText, findByText } = render(
    <StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <Counter />
      </Suspense>
    </StrictMode>,
  );

  await findByText('baseAtom: [0]');
  await findByText('asyncAtom: [0]');

  fireEvent.click(getByText('append'));
  await findByText('baseAtom: [0,1]');
  await findByText('asyncAtom: [0,1]');

  fireEvent.click(getByText('incr async'));
  await findByText('baseAtom: [0,1,2]');
  await findByText('asyncAtom: [0,1,2]');

  fireEvent.click(getByText('incr base'));
  await findByText('baseAtom: [0,1,2,3]');
  await findByText('asyncAtom: [0,1,2,3]');
});
