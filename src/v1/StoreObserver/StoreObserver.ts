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
import { AnyMutation } from "../Mutations";
import { OutcomeUpdater } from "./OutcomeUpdater";
import { ObservableEvent } from "./ObservableEvent";

/**
 * `StoreObserver` is an object that wants to be told of changes made
 * to a {@link Store}.
 *
 * Unlike {@link StoreSubscriber} functions, `StoreObserver` objects:
 * - get notified before and after a change has been made
 * - should always succeed (ie, never throw an exception)
 * - should never attempt to change the store (that's why we never tell
 *   the observer which Store is being mutated)
 *
 * We've added them for debugging / unit testing support. You're welcome
 * to use them creatively.
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export interface StoreObserver<T extends object, M extends AnyMutation>
{
    /**
     * `beforeMutationApplied()` is called to notify the StoreObserver
     * that the {@link Store} is about to be mutated.
     *
     * @param event
     * details of the mutation that is about to begin
     *
     * @returns a function that you need to call when the mutation has
     * completed
     */
    beforeMutationApplied(event: ObservableEvent<T,M>): OutcomeUpdater<T>;
}