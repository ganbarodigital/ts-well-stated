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
import { AppError, AppErrorOr, HashMap } from "@safelytyped/core-types";
import { copy } from "copy-anything";
import { DateTime } from "luxon";

import { ObservableEvent } from ".";
import { AnyMutation } from "../Mutations";
import { ExtensionUnsubscriber, StoreExtensions } from "../StoreExtensions";
import { OutcomeUpdater } from "./OutcomeUpdater";
import { StoreObserver } from "./StoreObserver";

/**
 * `StoreObservers` manages a list of {@link StoreObserver} objects.
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreObservers<
    T extends object,
    M extends AnyMutation
>
{
    /**
     * `observers` holds a list of {@link StoreObserver} objects.
     *
     * The index is the class name of the mutation that each observer
     * is interested in. An observer may be registered against multiple
     * mutation class names.
     */
    public observers: StoreExtensions<T,M,StoreObserver<T,M>>;

    /**
     * `constructor()` creates a new `StoreObservers` object.
     *
     * @param observers
     * the initial list of {@link StoreObserver} objects that we should
     * call whenever {@link notifyObservers} is called.
     */
    public constructor(observers: HashMap<StoreObserver<T,M>[]> = {})
    {
        this.observers = new StoreExtensions(observers);
    }

    /**
     * `registerObserver()` adds your observer to our observer lists.
     * We will notify your observer whenever the store is being updated.
     *
     * We send back a function that you can call if you never need to
     * unsubscribe your `fn` {@link StoreObserverSubscriber}.
     *
     * NOTE:
     * - you can call the unsubscribe function at any time
     * - if you call it from inside any {@link StoreObserverSubscriber}, it
     *   won't take effect until the store has finished applying the mutation.
     *
     * @param observer
     * we will call this observer just before the mutation is applied.
     * @param mutationNames
     * the class name of the mutation(s) that you want to observe.
     * You can subscribe to 'Object' to get told about all changes made
     * in the Store.
     */
    public registerObserver(
        observer: StoreObserver<T,M>,
        ...mutationNames: string[]
    ): ExtensionUnsubscriber
    {
        return this.observers.add(observer, ...mutationNames);
    }

    /**
     * `forEach()` is called by a {@link Store} just before it begins
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
     * @param mutation
     * the change that the Store has been asked to apply
     * @param initialState
     * the calling Store's state BEFORE the mutation is applied
     * @returns
     * a function that the Store can call to tell the observers what
     * happened after attempting to apply the `mutation`
     */
    public forEach(
        mutation: M,
        initialState: T,
    ): OutcomeUpdater<T>
    {
        // what are we going to tell our observers?
        const storeEvent: ObservableEvent<T,M> = {
            mutation,
            initialState,
            outcome: initialState,
            createdAt: DateTime.local().toJSDate(),
        }

        // keep track of how we're going to tell our observers
        // what the outcome us
        const updaterFns: OutcomeUpdater<T>[] = [];

        this.observers.forEach(mutation, (observer) => {
            updaterFns.push(observer.beforeMutationApplied(storeEvent))
        });

        return (outcome: AppErrorOr<T>, completedAt: Date) => {
            // optimisation
            if (updaterFns.length === 0) {
                return;
            }

            // we need to avoid side-effects!
            if (!(outcome instanceof AppError)) {
                outcome = copy(outcome);
            }

            // spread the news
            updaterFns.forEach((updaterFn) => updaterFn(outcome, completedAt));
        }
    }
}