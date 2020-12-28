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
 * `StoreGuarantee<ST,M>` is a function type. It describes functions
 * that get notified before a mutation is applied to the store.
 *
 * Each `StoreGuarantee` can:
 * - reject: it can throw Errors to reject the mutation
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a list of the mutations that the store supports
 *
 * @param {ST} state
 * - this is a copy of the current state in the store. Treat it as readonly.
 * @param {M} mutation
 * - this is the state change that the Store wants to apply
 */
export type StoreGuarantee<ST, M extends AnyMutation>
    = (
        mutation: M,
        state: ST,
        options: StoreOptions,
    ) => void;