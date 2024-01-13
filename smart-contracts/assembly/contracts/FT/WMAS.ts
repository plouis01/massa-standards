import { Args, u256ToBytes } from '@massalabs/as-types';
import {
  Address,
  Context,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { burn } from './burnable/burn';
import { _balance, _setBalance } from './token-internals';
import { u256 } from 'as-bignum/assembly/integer/u256';
import { _mint } from './mintable/mint-internal';

export * from './token';

/**
 * Wrap wanted value.
 *
 * @param {StaticArray<u8>} _ - unused but mandatory. See https://github.com/massalabs/massa-sc-std/issues/18
 */
export function deposit(_: StaticArray<u8>): void {
  const amount = Context.transferredCoins();
  const recipient = Context.caller();
  assert(amount > 0, 'Payment must be more than 0 MAS');

  const args = new Args().add(recipient).add(u256.from(amount));
  _mint(args.serialize());
}

/**
 * Unwrap wanted value.
 *
 * @param {StaticArray<u8>} bs - Byte string
 */
export function withdraw(bs: StaticArray<u8>): void {
  const args = new Args(bs);
  const amount = args.nextU64().unwrap();
  assert(amount > 0, 'Payment must be more than 0 WMAS');

  burn(u256ToBytes(u256.from(amount)));
  transferCoins(new Address(args.nextString().unwrap()), amount);
}
