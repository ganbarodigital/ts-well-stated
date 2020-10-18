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

import { AnyMutation } from "../Mutations";
import { StoreOptions } from "../Store";
import { ExtensionUnsubscriber, StoreExtensions } from "../StoreExtensions";
import { StoreGuard } from "./StoreGuard";

/**
 * `StoreGuards` manages a list of {@link StoreGuard}s.
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreGuards<
    T extends object,
    M extends AnyMutation
> {

    public guards: StoreExtensions<T,M,StoreGuard<T,M>>;

    /**
     * `constructor()` builds a new `StoreGuard` object.
     *
     * @param guards
     * The initial list of functions that want to be notified about upcoming
     * changes to the state of the {@link Store}.
     */
    public constructor(guards: HashMap<StoreGuard<T,M>[]> = {})
    {
        this.guards = new StoreExtensions(guards);
    }

    /**
     * `registerGuard()` adds your callback to our guard lists.
     * We will call your callback whenever these mutations are about to be
     * applied to the store.
     *
     * We send back a function that you can call if you never need to
     * unsubscribe your `fn` {@link StoreSubscriber}.
     *
     * NOTE:
     * - you can call the unsubscribe function at any time
     * - if you call it from inside any {@link StoreGuard}, it won't
     *   take effect until we've finished calling the remaining guards
     *
     * @param fn
     * we will call this function before `mutation` has been applied to
     * the store
     * @param mutationNames
     * the class name of the mutation(s) that you want to subscribe to.
     * You can subscribe to 'Object' to get told about all changes made
     * in the Store.
     */
    public registerGuard(
        fn: StoreGuard<T,M>,
        ...mutationNames: string[]
    ): ExtensionUnsubscriber
    {
        return this.guards.add(fn, ...mutationNames);
    }

    /**
     * `forEach()` triggers a call to every guard that has registered for
     * `mutation`.
     *
     * Internally, we use {@link getClassNames} to work out which guards
     * to call.
     *
     * @param mutation
     * The mutation that the {@link Store} has been asked to apply.
     * @param state
     * The state of the store, before the mutation has been applied.
     * @param onError
     * Call this if an error occurs, and throw its return value.
     */
    public forEach
    (
        mutation: M,
        state: T,
        {
            onError = THROW_THE_ERROR
        }: Partial<StoreOptions> = {}
    ): void
    {
        this.guards.forEach(mutation, (callbackFn) => {
            callbackFn(mutation, state, { onError });
        });
    }
}