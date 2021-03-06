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
import { Store, StoreOptions } from "../Store";
import { StoreWatchListOptions } from "../Store/StoreWatchListOptions";
import { StoreSubscriber } from "./StoreSubscriber";

/**
 * `StoreSubscribers` manages a list of {@link StoreSubscriber}s.
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreSubscribers<
    ST,
    M extends AnyMutation
> extends WatchList<StoreSubscriber<ST,M>>
{
    /**
     * `notify()` triggers a call to every subscriber that has
     * registered for `mutation`.
     *
     * @param subscribers
     * The collection of subscribers that we will search, to find subscribers
     * that have registered to be told about `mutation`.
     * @param mutation
     * The mutation that has been applied.
     * @param state
     * The state of the store, after the mutation has been applied.
     * @param store
     * The store itself, in case you want to apply more mutations.
     * @param onError
     * Call this if an error occurs, and throw its return value.
     * @param topics
     * A list of topics to find handlers for.
     */
    public static notify<ST, M extends AnyMutation>
    (
        subscribers: StoreSubscribers<ST,M>,
        mutation: M,
        state: ST,
        store: Store<ST, M>,
        {
            onError = THROW_THE_ERROR,
            topics = getTopicsFromMutation(mutation)
        }: Partial<StoreWatchListOptions & StoreOptions> = {}
    ): void
    {
        subscribers.forEach(
            (subscriber) => {
                subscriber(mutation, state, store, { onError });
            },
            ...topics
        );
    }
}