//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with this program. If not, see
// <https://www.gnu.org/licenses/>.
//

import { AnyMutation } from "../Mutations";
import { Store, StoreOptions } from "../Store";

/**
 * `StoreSubscriber<S,M>` is a function type. It describes functions
 * that get notified when a mutation has been applied to the store.
 *
 * Each `StoreSubscriber` can:
 * - react: it can call the {@link Store} to apply more mutations
 * - reject: it can throw Errors to reject the mutation
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 *
 * @param {M} mutation
 * - this is the state change that has been applied to the Store
 * @param {ST} state
 * - this is the new state in the store
 * @param {Store<ST,M>} store
 * - this is the store that the state is held within (in case you want to
 *   trigger more changes)
 */
export type StoreSubscriber<ST, M extends AnyMutation>
    = (
        mutation: M,
        state: ST,
        store: Store<ST, M>,
        options: StoreOptions,
    ) => void;