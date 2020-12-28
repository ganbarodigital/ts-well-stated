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
import { AppErrorOr, NonEmptyArray } from "@safelytyped/core-types";
import { WatchList } from "@safelytyped/well-watched";

import { AnyMutation, getTopicsFromMutation } from "../Mutations";
import { OutcomeUpdater } from "./OutcomeUpdater";
import { StoreObserver } from "./StoreObserver";

/**
 * `StoreObservers` manages a list of {@link StoreObserver} objects.
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreObservers<
    ST,
    M extends AnyMutation
> extends WatchList<StoreObserver<ST,M>>
{
    /**
     * `prepare()` is called by a {@link Store} just before it begins
     * to apply the `mutation`.
     *
     * We pass the `mutation` to all of the registered observers. They
     * are called in the order that they registered with this manager.
     *
     * NOTE:
     * - we do not `catch()` any Errors thrown by observers.
     * - observers are meant to be passive (ie not directly interfere
     *   with the operation of the Store). They should catch their own
     *   Errors.
     *
     * @param observers
     * The collection of observers that we will search to find the observers
     * that have registered to be told about `mutation`.
     * @param mutation
     * The change that the Store has been asked to apply
     * @param initialState
     * The calling Store's state BEFORE the mutation is applied
     * @param topics
     * A list of topics to find handlers for.
     * @returns
     * A function that the Store can call to tell the observers what
     * happened after attempting to apply the `mutation`
     */
    public static prepare<ST, M extends AnyMutation>(
        observers: StoreObservers<ST,M>,
        mutation: M,
        initialState: ST,
        {
            topics = getTopicsFromMutation(mutation)
        }: {
            topics?: NonEmptyArray<string>
        } = {}
    ): OutcomeUpdater<ST>
    {
        // keep track of how we're going to tell our observers
        // what the outcome us
        const updaterFns: OutcomeUpdater<ST>[] = [];

        observers.forEach(
            (observer) => {
                updaterFns.push(
                    observer.beforeMutationApplied(
                        mutation,
                        initialState
                    )
                );
            },
            ...topics
        );

        return (outcome: AppErrorOr<ST>) => {
            // spread the news
            updaterFns.forEach((updaterFn) => updaterFn(outcome));
        }
    }
}