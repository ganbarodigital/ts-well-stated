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
import { HashMap } from "@safelytyped/core-types";

import { InterestUnsubscriber } from "./InterestUnsubscriber";

/**
 * `InterestsRegistry` manages a list of topics and the functions / objects
 * that have registered an interest in each topic.
 *
 * @template E
 * the type of function / object that can subscribe to these topics
 */
export class InterestsRegistry<E>
{
    /**
     * `_theList` holds a list of topics, and the callbacks that have
     * been registered against each topic.
     */
    protected _theList: HashMap<E[]>;

    /**
     * `constructor()` creates a new `InterestsRegistry` object.
     *
     * @param initialInterests
     * the initial list of topics and their callbacks
     */
    public constructor(initialInterests: HashMap<E[]> = {})
    {
        this._theList = initialInterests;
    }

    /**
     * `add()` adds your call to our list.
     *
     * We send back a function that you can call if you ever need to
     * unsubscribe your interest.
     *
     * NOTE:
     * - you can call the unsubscribe function at any time
     *
     * @param interest
     * the function / object to register
     * @param topics
     * the list of topics that the `interest` wants to be registered
     * against
     * @returns
     * call this function if you ever need to unsubscribe your callback
     */
    public add(
        interest: E,
        ...topics: string[]
    ): InterestUnsubscriber
    {
        // keep track of our unsubscribe functions
        const unsubs: InterestUnsubscriber[] = [];

        // which topics is the caller interested in?
        topics.forEach((topicName) => {
            unsubs.push(this._registerInterestForTopic(topicName, interest));
        });

        // make it easy to unsubscribe in the future
        return () => {
            unsubs.forEach((unsub) => unsub());
        }
    }

    /**
     * `_registerInterestForTopic()` associates your `interest` with
     * a single `topicName`.
     *
     * We send back a function that you can call if you never need to
     * unsubscribe your `interest`.
     *
     * @param topicName
     * the topic name that your `interest`` wants to be registered against
     * @param interest
     * the function or object that wants to be associated with `topicName`
     * @returns
     * a function that you can call when you want to unsubscribe your
     * `interest`
     */
    private _registerInterestForTopic(
        topicName: string,
        interest: E
    ): InterestUnsubscriber {
        // add it to the list
        this._theList[topicName].push(interest);

        // we need to tell the caller how to unsubscribe
        return( () => {
            const index = this._theList[topicName].indexOf(interest);
            if (index > -1) {
                this._theList[topicName].splice(index, 1);
            }
        });
    }

    /**
     * `forEach()` will call your `fn` for each interest that is registered
     * against the given `topics`.
     *
     * @param callback
     * We will call this callback every time we find an interest that has
     * registered for any of the given `topics`.
     * @param topics
     * Which topics do we want to find interests for?
     */
    public forEach(
        callback: (interest: E) => void,
        ...topics: string[]
    ): void
    {
        topics.forEach((name) => {
            // shorthand
            const interests = this._theList[name] ?? [];

            interests.forEach((interest) => {
                callback(interest);
            });
        });

        // all done
    }

    /**
     * `.length` tells you how many callbacks are currently registered.
     *
     * If (for example) the same callback is listening for two topics, it
     * gets counted twice.
     */
    public get length(): number {
        let retval = 0;

        HashMap.forEach(this._theList, (extensions) => {
            retval = retval + extensions.length;
        });

        // all done
        return retval;
    }
}