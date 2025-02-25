import { afterEach, test } from 'vitest';
import { StrictMode, Suspense } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent as userEventOrig } from '@testing-library/user-event';
import { expectType } from 'ts-expect';
import { useAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import type { SetStateAction, WritableAtom } from 'jotai/vanilla';
import * as O from 'optics-ts';
import { focusAtom } from 'jotai-optics';

const userEvent = {
  click: (element: Element) => act(() => userEventOrig.click(element)),
};

const succ = (input: number) => input + 1;

afterEach(cleanup);

test('basic derivation using focus works', async () => {
  const bigAtom = atom({ a: 0 });
  const focusFunction = (optic: O.OpticFor_<{ a: number }>) => optic.prop('a');

  const Counter = () => {
    const [count, setCount] = useAtom(focusAtom(bigAtom, focusFunction));
    const [bigAtomValue] = useAtom(bigAtom);
    return (
      <>
        <div>bigAtom: {JSON.stringify(bigAtomValue)}</div>
        <div>count: {count}</div>
        <button onClick={() => setCount(succ)}>incr</button>
        <button onClick={() => setCount(0)}>set zero</button>
      </>
    );
  };

  render(
    <StrictMode>
      <Counter />
    </StrictMode>,
  );

  await screen.findByText('count: 0');
  await screen.findByText('bigAtom: {"a":0}');

  await userEvent.click(screen.getByText('incr'));
  await screen.findByText('count: 1');
  await screen.findByText('bigAtom: {"a":1}');

  await userEvent.click(screen.getByText('incr'));
  await screen.findByText('count: 2');
  await screen.findByText('bigAtom: {"a":2}');

  await userEvent.click(screen.getByText('set zero'));
  await screen.findByText('count: 0');
  await screen.findByText('bigAtom: {"a":0}');
});

test('focus on an atom works', async () => {
  const bigAtom = atom({ a: 0 });
  const focusFunction = (optic: O.OpticFor_<{ a: number }>) => optic.prop('a');

  const Counter = () => {
    const [count, setCount] = useAtom(focusAtom(bigAtom, focusFunction));
    const [bigAtomValue] = useAtom(bigAtom);
    return (
      <>
        <div>bigAtom: {JSON.stringify(bigAtomValue)}</div>
        <div>count: {count}</div>
        <button onClick={() => setCount(succ)}>button</button>
      </>
    );
  };

  render(
    <StrictMode>
      <Counter />
    </StrictMode>,
  );

  await screen.findByText('count: 0');
  await screen.findByText('bigAtom: {"a":0}');

  await userEvent.click(screen.getByText('button'));
  await screen.findByText('count: 1');
  await screen.findByText('bigAtom: {"a":1}');
});

test('double-focus on an atom works', async () => {
  const bigAtom = atom({ a: { b: 0 } });
  const atomA = focusAtom(bigAtom, (optic) => optic.prop('a'));
  const atomB = focusAtom(atomA, (optic) => optic.prop('b'));

  const Counter = () => {
    const [bigAtomValue, setBigAtom] = useAtom(bigAtom);
    const [atomAValue, setAtomA] = useAtom(atomA);
    const [atomBValue, setAtomB] = useAtom(atomB);
    return (
      <>
        <div>bigAtom: {JSON.stringify(bigAtomValue)}</div>
        <div>atomA: {JSON.stringify(atomAValue)}</div>
        <div>atomB: {JSON.stringify(atomBValue)}</div>
        <button onClick={() => setBigAtom((v) => ({ a: { b: v.a.b + 1 } }))}>
          inc bigAtom
        </button>
        <button onClick={() => setAtomA((v) => ({ b: v.b + 2 }))}>
          inc atomA
        </button>
        <button onClick={() => setAtomB((v) => v + 3)}>inc atomB</button>
      </>
    );
  };

  render(
    <StrictMode>
      <Counter />
    </StrictMode>,
  );

  await screen.findByText('bigAtom: {"a":{"b":0}}');
  await screen.findByText('atomA: {"b":0}');
  await screen.findByText('atomB: 0');

  await userEvent.click(screen.getByText('inc bigAtom'));
  await screen.findByText('bigAtom: {"a":{"b":1}}');
  await screen.findByText('atomA: {"b":1}');
  await screen.findByText('atomB: 1');

  await userEvent.click(screen.getByText('inc atomA'));
  await screen.findByText('bigAtom: {"a":{"b":3}}');
  await screen.findByText('atomA: {"b":3}');
  await screen.findByText('atomB: 3');

  await userEvent.click(screen.getByText('inc atomB'));
  await screen.findByText('bigAtom: {"a":{"b":6}}');
  await screen.findByText('atomA: {"b":6}');
  await screen.findByText('atomB: 6');
});

test('focus on async atom works', async () => {
  const baseAtom = atom({ count: 0 });
  const asyncAtom = atom(
    (get) => Promise.resolve(get(baseAtom)),
    async (get, set, param: SetStateAction<Promise<{ count: number }>>) => {
      const prev = Promise.resolve(get(baseAtom));
      const next = await (typeof param === 'function' ? param(prev) : param);
      set(baseAtom, next);
    },
  );
  const focusFunction = (optic: O.OpticFor_<{ count: number }>) =>
    optic.prop('count');

  const Counter = () => {
    const [count, setCount] = useAtom(focusAtom(asyncAtom, focusFunction));
    const [asyncValue, setAsync] = useAtom(asyncAtom);
    const [baseValue, setBase] = useAtom(baseAtom);
    return (
      <>
        <div>baseAtom: {baseValue.count}</div>
        <div>asyncAtom: {asyncValue.count}</div>
        <div>count: {count}</div>
        <button onClick={() => setCount(succ)}>incr count</button>
        <button
          onClick={() =>
            setAsync((p) => p.then((v) => ({ count: v.count + 1 })))
          }
        >
          incr async
        </button>
        <button onClick={() => setBase((v) => ({ count: v.count + 1 }))}>
          incr base
        </button>
      </>
    );
  };

  await act(async () => {
    render(
      <StrictMode>
        <Suspense fallback={<div>Loading...</div>}>
          <Counter />
        </Suspense>
      </StrictMode>,
    );
  });

  await screen.findByText('baseAtom: 0');
  await screen.findByText('asyncAtom: 0');
  await screen.findByText('count: 0');

  await userEvent.click(screen.getByText('incr count'));
  await screen.findByText('baseAtom: 1');
  await screen.findByText('asyncAtom: 1');
  await screen.findByText('count: 1');

  await userEvent.click(screen.getByText('incr async'));
  await screen.findByText('baseAtom: 2');
  await screen.findByText('asyncAtom: 2');
  await screen.findByText('count: 2');

  await userEvent.click(screen.getByText('incr base'));
  await screen.findByText('baseAtom: 3');
  await screen.findByText('asyncAtom: 3');
  await screen.findByText('count: 3');
});

type BillingData = {
  id: string;
};

type CustomerData = {
  id: string;
  billing: BillingData[];
  someOtherData: string;
};

test('typescript should accept "undefined" as valid value for lens', async () => {
  const customerListAtom = atom<CustomerData[]>([]);

  const foundCustomerAtom = focusAtom(customerListAtom, (optic) =>
    optic.find((el) => el.id === 'some-invalid-id'),
  );

  const derivedLens = focusAtom(foundCustomerAtom, (optic) => {
    const result = optic
      .valueOr({ someOtherData: '' } as unknown as CustomerData)
      .prop('someOtherData');
    return result;
  });

  expectType<WritableAtom<string, [SetStateAction<string>], void>>(derivedLens);
});

test('should work with promise based atoms with "undefined" value', async () => {
  const customerBaseAtom = atom<CustomerData | undefined>(undefined);

  const asyncCustomerDataAtom = atom(
    async (get) => get(customerBaseAtom),
    async (_, set, nextValue: Promise<CustomerData>) => {
      set(customerBaseAtom, await nextValue);
    },
  );

  const focusedPromiseAtom = focusAtom(asyncCustomerDataAtom, (optic) => {
    const result = optic
      .valueOr({ someOtherData: '' } as unknown as CustomerData)
      .prop('someOtherData');
    return result;
  });

  expectType<
    WritableAtom<Promise<string>, [SetStateAction<string>], Promise<void>>
  >(focusedPromiseAtom);
});
