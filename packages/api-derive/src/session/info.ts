// Copyright 2017-2023 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Observable } from 'rxjs';
import type { DeriveApi, DeriveSessionInfo } from '../types';

import { map } from 'rxjs';

import { objectSpread } from '@polkadot/util';

import { memo } from '../util';

/**
 * @description Retrieves all the session and era query and calculates specific values on it as the length of the session and eras
 */
export function info (instanceId: string, api: DeriveApi): () => Observable<DeriveSessionInfo> {
  return memo(instanceId, (): Observable<DeriveSessionInfo> =>
    api.derive.session.indexes().pipe(
      map((indexes) => {
        const sessionLength = api.consts?.babe?.epochDuration || api.registry.createType('u64', 1);
        const sessionsPerEra = api.consts?.staking?.sessionsPerEra || api.registry.createType('SessionIndex', 1);

        return objectSpread({
          eraLength: api.registry.createType('BlockNumber', sessionsPerEra.mul(sessionLength)),
          isEpoch: !!api.query.babe,
          sessionLength,
          sessionsPerEra
        }, indexes);
      })
    )
  );
}
