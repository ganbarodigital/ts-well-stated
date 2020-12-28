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

import { AnyMutation } from ".";
import { UnhandledMutationError } from "../Errors";
import { Store, StoreOptions, StoreWatchListOptions } from "../Store";
import { MutationHandlersOptions } from "./MutationHandlersOptions";
import { getTopicsFromMutation } from "./getTopicsFromMutation";
import { MutationHandler } from "./MutationHandler";

/**
 * `MutationHandlers` manages a list of functions that apply changes
 * (known as mutations) to a {@link Store}.
 *
 * @template ST
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class MutationHandlers<
    ST,
    M extends AnyMutation
> extends WatchList<MutationHandler<ST,M>>
{
    /**
     * `apply()` is called by a {@link Store} whenever it has been
     * given a mutation to apply.
     *
     * We pass the `mutation` to all of the registered mutation handlers.
     * They are called in the order that they were registered.
     *
     * @param mutation
     * the change that you want to apply
     * @param state
     * the data structure that each handler needs to update
     * @param store
     * The {@link Store} that called us. The handlers can use this to apply
     * additional mutations if required.
     * @param onError
     * - each handler should call your `onError` handler if a problem
     *   occurs
     * @param topics
     * A list of topics to find handlers for.
     * @param onUnhandledMutation
     * - we will call your `onUnhandledMutation` handler if we can't find
     *   any registered handlers for the mutation. Your handler can throw
     *   an Error, or it can simply return
     */
    public static apply<ST, M extends AnyMutation>
    (
        mutations: MutationHandlers<ST,M>,
        mutation: M,
        state: ST,
        store: Store<ST,M>,
        {
            onUnhandledMutation = THROW_THE_ERROR,
            onError = THROW_THE_ERROR,
            topics = getTopicsFromMutation(mutation),
        }: Partial<MutationHandlersOptions & StoreOptions & StoreWatchListOptions> = {},
    )
    {
        // we use this to avoid silent failures!
        let handlerCalled = false;

        // find and call the relevent mutation handlers
        mutations.forEach(
            (handler) => {
                handlerCalled = true;
                handler(mutation, state, store, { onError });
            },
            ...topics
        );

        // did we find at least ONE relevant mutation handler?
        if (!handlerCalled) {
            onUnhandledMutation(new UnhandledMutationError({logsOnly: {mutation}}));
        }
    }
}