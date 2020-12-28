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
import { THROW_THE_ERROR } from "@safelytyped/core-types";
import { WatchList } from "@safelytyped/well-watched";

import { AnyMutation, getTopicsFromMutation } from "../Mutations";
import { StoreOptions } from "../Store/StoreOptions";
import { StoreWatchListOptions } from "../Store/StoreWatchListOptions";
import { StoreGuarantee } from "./StoreGuarantee";

/**
 * `StoreGuarantees` manages a list of {@link StoreGuarantee}s.
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreGuarantees<
    ST,
    M extends AnyMutation
> extends WatchList<StoreGuarantee<ST,M>>
{
    /**
     * `apply()` triggers a call to every guard that has registered for
     * `mutation`.
     *
     * Internally, we use {@link getTopicsFromMutation} to work out which
     * guards to call.
     *
     * @param guarantees
     * The collection of guarantees that we will search for guarantees
     * that are registered to be told about `mutation`.
     * @param mutation
     * The mutation that the {@link Store} has been asked to apply.
     * @param state
     * The state of the store, before the mutation has been applied.
     * @param onError
     * Call this if an error occurs, and throw its return value.
     * @param topics
     * A list of topics to find guarantees for.
     */
    public static apply<ST, M extends AnyMutation>
    (
        guarantees: StoreGuarantees<ST,M>,
        mutation: M,
        state: ST,
        {
            onError = THROW_THE_ERROR,
            topics = getTopicsFromMutation(mutation),
        }: Partial<StoreWatchListOptions & StoreOptions> = {}
    ): void
    {
        guarantees.forEach(
            (guarantee) => {
                guarantee(mutation, state, { onError });
            },
            ...topics
        );
    }
}