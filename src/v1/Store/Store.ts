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
import { copy } from "copy-anything";
import { DateTime } from "luxon";

import { AnyMutation, MutationHandlers } from "../Mutations";
import { AnyState } from "../State";
import { StoreGuards } from "../StoreGuard";
import { StoreObservers } from "../StoreObserver";
import { StoreSubscribers } from "../StoreSubscriber";
import { NotifyHandlersOptions } from "./NotifyHandlersOptions";

/**
 * `Store` is a type-safe, Flux-like state store. Well, it's probably more
 * like a VueX store. But it's type-safe, which is the main thing.
 *
 * Use it to hold the main state of your application or a component. Other
 * code can register (and de-register!) their own:
 *
 * - handlers (functions that update the store)
 * - subscribers (functions that react to changes to the store)
 * - observers (passive subscribers)
 *
 * to effect and respond to change.
 *
 * While we've tried to make the Store perform well, it does favour
 * correctness over performance. In particular, we do make deep copies
 * (plural!) of the Store's internal state whenever you apply a mutation.
 *
 * @template S
 * - `S` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class Store<
    S extends AnyState,
    M extends AnyMutation
>
{
    /**
     * `_state` holds the current state of the store.
     *
     * @protected
     */
    protected _state: S;

    /**
     * `guards` managers the functions that are responsible for validating
     * mutations before they are applied to the Store. The store calls
     * these functions whenever you pass a mutation into {@link apply}().
     */
    public guards: StoreGuards<S,M>;

    /**
     * `handlers` holds a list of functions that are responsible for
     * applying changes to the Store. The store calls these functions
     * whenever you pass a mutation into {@link apply}().
     *
     * Handlers can throw exceptions to reject a change to the store.
     */
    public handlers: MutationHandlers<S,M>;

    /**
     * `subscribers` manages a list of functions that want to be notified
     * about changes to the Store. The store calls these functions after
     * it has called the handlers.
     *
     * Subscribers can react (they can apply more changes to the Store),
     * and they can reject (they can throw exceptions to reject changes
     * to the store).
     */
    public subscribers: StoreSubscribers<S,M>;

    /**
     * `observers` holds a list of objects that want to be notified
     * about attempts to change the Store.
     *
     * Unlike subscribers, observers cannot directly react or reject.
     * They're intended to be passive subscribers, perhaps for debugging
     * or testing purposes.
     */
    public observers: StoreObservers<S,M>;

    /**
     * `constructor` creates a new Store.
     *
     * @param initialState
     * The initial value that the Store will start with. We will take a
     * deep clone of this, to prevent side-effects.
     * @param guards
     * The initial list of guards that will validate mutations before they
     * are applied.
     * @param handlers
     * The initial list of functions that will apply mutations to the Store's
     * internal state.
     * @param observers
     * The initial list of functions that will be notified when we attempt
     * to apply mutations to the Store's internal state.
     * @param subscribers
     * The initial list of functions that will be notified after we have
     * applied a mutation to the Store's initial state.
     */
    public constructor(
        initialState: S,
        {
            guards = new StoreGuards(),
            handlers = new MutationHandlers(),
            observers = new StoreObservers(),
            subscribers = new StoreSubscribers(),
        }: Partial<{
            guards: StoreGuards<S,M>,
            handlers: MutationHandlers<S,M>,
            observers: StoreObservers<S,M>,
            subscribers: StoreSubscribers<S,M>,
        }> = {}
    )
    {
        // for safety's sake, we deep-clone the initial state
        this._state = copy(initialState);

        // keep track of all of our helpers
        this.guards = guards;
        this.handlers = handlers;
        this.observers = observers;
        this.subscribers = subscribers;
    }

    /**
     * `apply()` is how we change the state in the store.
     *
     * We pass the `mutation` to all of the registered mutation handlers.
     * They are called in the order that they were registered.
     *
     * We also call all registered observers and subscribers along the way.
     *
     * If any Error occurs, we make sure that the state of the Store is
     * unchanged, and then we rethrow the Error (ie, we throw away ALL
     * changes made to the Store during this `apply()` method).
     *
     * This way, we guarantee that the Store is always in a consistent state.
     *
     * @param mutation
     * the change that you want to apply
     * @param onError
     * - a handler or subscriber will call your `onError` handler if a problem
     *   occurs
     * @param onUnhandledMutation
     * - we will call your `onUnhandledMutation` handler if we can't find
     *   any registered handlers for the mutation. Your handler can throw
     *   an Error, or it can simply return
     */
    public apply(
        mutation: M,
        {
            onUnhandledMutation = THROW_THE_ERROR,
            onError = THROW_THE_ERROR
        }: Partial<NotifyHandlersOptions> = {}
    ) {
        // take a backup, in case an error occurs
        const initialState = copy(this._state);

        // tell our observers that we're beginning a change
        //
        // we will update them once we know what the outcome is
        const updateOutcome = this.observers.forEach(
            mutation,
            initialState,
        );

        // if anything goes wrong, the guards / handlers / subscribers
        // will throw an Error to tell us about it
        try {
            // check with the guards first!
            this.guards.forEach(mutation, this._state, { onError });

            // tell the handlers to update our live state
            this.handlers.forEach(
                mutation,
                this._state,
                this,
                {
                    onUnhandledMutation,
                    onError
                }
            );

            // tell everyone who cares that a mutation has been
            // successfully applied
            this.subscribers.forEach(
                mutation,
                this._state,
                this,
                { onError }
            );
        }
        catch (e) {
            // anything goes wrong, we assume that the store currently
            // holds an illegal state ... so we roll back
            this._state = initialState;

            // tell the observers that something went very wrong
            updateOutcome(e, DateTime.local().toJSDate());

            // continue to unwind the stack
            throw e;
        }

        // if we get here, we're good

        // tell the observers about our new state
        //
        // we don't need to pass a deep-copy here. `updateOutcome()` will
        // make one if needed.
        updateOutcome(this._state, DateTime.local().toJSDate());
    }

    /**
     * `.state` gives you read-only access to the current state of this
     * store.
     *
     * NOTE: we do not return a clone of the state (for performance reasons).
     * Don't abuse this!
     */
    public get state(): Readonly<S> {
        return this._state;
    }
}
