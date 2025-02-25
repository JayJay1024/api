// Copyright 2017-2023 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { AccountId } from '@polkadot/types/interfaces';
import type { DeriveApi, DeriveSocietyMember } from '../types';

import { combineLatest, map, of, switchMap } from 'rxjs';

import { memo } from '../util';

export function _members (instanceId: string, api: DeriveApi): (accountIds: AccountId[]) => Observable<DeriveSocietyMember[]> {
  return memo(instanceId, (accountIds: AccountId[]): Observable<DeriveSocietyMember[]> =>
    combineLatest([
      of(accountIds),
      api.query.society.payouts.multi(accountIds),
      api.query.society.strikes.multi(accountIds),
      api.query.society.defenderVotes.multi(accountIds),
      api.query.society.suspendedMembers.multi(accountIds),
      api.query.society.vouching.multi(accountIds)
    ]).pipe(
      map(([accountIds, payouts, strikes, defenderVotes, suspended, vouching]) =>
        accountIds.map((accountId, index) => ({
          accountId,
          isDefenderVoter: defenderVotes[index].isSome,
          isSuspended: suspended[index].isTrue,
          payouts: payouts[index],
          strikes: strikes[index],
          vote: defenderVotes[index].unwrapOr(undefined),
          vouching: vouching[index].unwrapOr(undefined)
        }))
      )
    )
  );
}

/**
 * @description Get the member info for a society
 */
export function members (instanceId: string, api: DeriveApi): () => Observable<DeriveSocietyMember[]> {
  return memo(instanceId, (): Observable<DeriveSocietyMember[]> =>
    api.query.society.members().pipe(
      switchMap((members) => api.derive.society._members(members))
    )
  );
}
