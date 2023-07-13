import { Args, boolToByte } from '@massalabs/as-types';
import { changeCallStack } from '@massalabs/massa-as-sdk';
import {
  grantRole,
  hasRole,
  members,
  onlyRole,
  revokeRole,
} from '../accessControl';

import { resetStorage } from '@massalabs/massa-as-sdk';
import { setOwner } from '../ownership';

// address of the contract set in vm-mock. must match with contractAddr of @massalabs/massa-as-sdk/vm-mock/vm.js
const contractAddr = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

const owner = 'AUDeadBeefDeadBeefDeadBeefDeadBeefDeadBeefDeadBOObs';
const randomUser = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiq';
const minterUser = 'AU12Ny7y5CndDDFgMJcq5kQiUJQTLutaVqUBnqTHDQALpocVBnkP';
const minterRole = 'minter';
const roleArg1 = new Args().add(minterRole).add(owner).serialize();
const roleArg2 = new Args().add(minterRole).add(minterUser).serialize();

beforeAll(() => {
  log('beforeAll');
  resetStorage();
});

describe('Roles', () => {
  test('has no role yet', () => {
    expect(hasRole(roleArg1)).toStrictEqual(boolToByte(false));
  });
  test('can grant a role', () => {
    setOwner(new Args().add(owner).serialize());
    switchUser(owner);
    grantRole(roleArg1);
    expect(hasRole(roleArg1)).toBeTruthy();
  });
  test('can revoke a role', () => {
    revokeRole(roleArg1);
    expect(hasRole(roleArg1)).toStrictEqual(boolToByte(false));
  });
  test('can get members of some role', () => {
    grantRole(roleArg1);
    grantRole(roleArg2);
    const minters = new Args(members(new Args().add(minterRole).serialize()))
      .nextStringArray()
      .unwrap();
    expect(minters).toStrictEqual([owner, minterUser]);
  });
  throws('cannot perform action without role', () => {
    switchUser(randomUser);
    onlyRole(minterRole);
  });
});

function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddr);
}
