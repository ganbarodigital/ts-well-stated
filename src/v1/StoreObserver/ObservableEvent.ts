//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
//   * Re-distributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in
//     the documentation and/or other materials provided with the
//     distribution.
//
//   * Neither the names of the copyright holders nor the names of his
//     contributors may be used to endorse or promote products derived
//     from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//

import { AppErrorOr } from "@safelytyped/core-types";
import { AnyMutation } from "../Mutations";
import { AnyState } from "../State";

/**
 * `ObservableEvent` is a record of a change applied to a {@link Store}.
 *
 * @template S
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export interface ObservableEvent<S extends AnyState, M extends AnyMutation> {
    /**
     * `mutation` is the data that has been passed to the store's list of
     * mutation handlers.
     */
    mutation: M;

    /**
     * `initialState` is the state of the store BEFORE the mutation handlers
     * were called.
     */
    initialState: S;

    /**
     * `outcome` is a record of what happened when the mutation handlers
     * were called.
     *
     * - the {@link AppError} that was thrown (if something went wrong), or
     * - the (possibly modified) state of the Store
     */
    outcome: AppErrorOr<Readonly<S>>;

    /**
     * `created_at` tracks when this event was created
     */
    createdAt: Date;

    /**
     * `completedAt` tracks when this event was completed
     */
    completedAt?: Date;
}