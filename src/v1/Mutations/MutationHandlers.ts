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
import { HashMap, THROW_THE_ERROR } from "@safelytyped/core-types";

import { AnyMutation } from ".";
import { UnhandledMutationError } from "../Errors";
import { Store } from "../Store";
import { NotifyHandlersOptions } from "../Store/NotifyHandlersOptions";
import { StoreExtensions, ExtensionUnsubscriber } from "../StoreExtensions";
import { MutationHandler } from "./MutationHandler";

/**
 * `MutationHandlers` manages a list of functions that apply changes
 * (known as mutations) to a {@link Store}.
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class MutationHandlers<
    T extends object,
    M extends AnyMutation
>
{
    /**
     * `extensions` holds a list of functions that apply changes to a
     * {@link Store}.
     */
    public extensions: StoreExtensions<T,M,MutationHandler<T,M>>;

    /**
     * `constructor()` creates a new {@link MutationHandlers} object.
     *
     * @param handlers
     * the initial list of functions to start with
     */
    public constructor(handlers: HashMap<MutationHandler<T,M>[]> = {})
    {
        this.extensions = new StoreExtensions(handlers);
    }

    /**
     * `registerHandler()` adds your callback to our subscriber lists.
     * We will call your callback whenever these mutations have been applied
     * to this store.
     *
     * We send back a function that you can call if you ever need to
     * unsubscribe your handler.
     *
     * @param fn
     * we will call this function after `mutation` has been applied to
     * the store
     * @param mutationNames
     * the class name of the mutation(s) that you want to subscribe to.
     * Use `Object` to register for all mutations.
     * @returns
     * call this function if you ever need to unsubscribe your handler
     */
    public registerHandler(
        fn: MutationHandler<T,M>,
        ...mutationNames: string[]
    ): ExtensionUnsubscriber
    {
        return this.extensions.add(fn, ...mutationNames);
    }

    /**
     * `forEach()` is called by a {@link Store} whenever it has been
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
     * the {@link Store} that called us. The handlers can use this to apply
     * additional mutations if required.
     * @param onError
     * - each handler should call your `onError` handler if a problem
     *   occurs
     * @param onUnhandledMutation
     * - we will call your `onUnhandledMutation` handler if we can't find
     *   any registered handlers for the mutation. Your handler can throw
     *   an Error, or it can simply return
     */
    public forEach
    (
        mutation: M,
        state: T,
        store: Store<T,M>,
        {
            onUnhandledMutation = THROW_THE_ERROR,
            onError = THROW_THE_ERROR
        }: Partial<NotifyHandlersOptions> = {}
    )
    {
        const handlerCalled = this.extensions.forEach(mutation, (handler) => {
            handler(mutation, state, store, { onError });
        });

        if (!handlerCalled) {
            onUnhandledMutation(new UnhandledMutationError({logsOnly: {mutation}}));
        }
    }
}