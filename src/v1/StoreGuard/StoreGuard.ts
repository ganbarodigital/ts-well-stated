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
import { StoreOptions } from "../Store";

/**
 * `StoreGuard<T,M>` is a function type. It describes functions
 * that get notified before a mutation is applied to the store.
 *
 * Each `StoreGuard` can:
 * - reject: it can throw Errors to reject the mutation
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 *
 * @param {M} mutation
 * - this is the state change that the Store wants to apply
 * @param {T} state
 * - this is the current state in the store
 *
 * @returns
 * - an {@link AppError} if this mutation causes a problem, or
 * - `null` otherwise
 */
export type StoreGuard<T extends object,M extends AnyMutation>
    = (
        mutation: M,
        state: Readonly<T>,
        options?: Partial<StoreOptions>,
    ) => void;