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
import { getClassNames, HashMap } from "@safelytyped/core-types";

import { AnyMutation } from "../Mutations";
import { ExtensionUnsubscriber } from "./ExtensionUnsubscriber";

/**
 * `StoreExtensions` manages a list of functions or objects that a
 * {@link Store} uses to deliver its functionality.
 *
 * @template T
 * - `T` is a type that describes all possible states of the store
 * @template M
 * - `M` is a type that describes all possible mutations that can be applied
 *   to the store
 */
export class StoreExtensions<
    T extends object,
    M extends AnyMutation,
    E
>
{
    /**
     * `_extensions` holds a list of extensions.
     *
     * The index is the class name of the mutation that the extension
     * is interested in.
     */
    protected _extensions: HashMap<E[]>;

    /**
     * `constructor()` creates a new `StoreExtensions` object.
     *
     * @param extensions
     * the initial list of extensions
     */
    public constructor(extensions: HashMap<E[]> = {})
    {
        this._extensions = extensions;
    }

    /**
     * `registerExtension()` adds your extension to our list.
     *
     * We send back a function that you can call if you ever need to
     * unsubscribe your extension.
     *
     * NOTE:
     * - you can call the unsubscribe function at any time
     * - if you call it from inside any extension, it won't take effect
     *   until the store has finished executing the rest of the extensions.
     *
     * @param extension
     * the extension to register
     * @param mutationNames
     * the class name of the mutation(s) that `extension` is interested in.
     * You can subscribe to 'Object' to ensure your `extension` is triggered
     * on every change to the store.
     * @returns
     * call this function if you ever need to unsubscribe your extension
     */
    public add(
        extension: E,
        ...mutationNames: string[]
    ): ExtensionUnsubscriber
    {
        // keep track of our unsubscribe functions
        const unsubs: ExtensionUnsubscriber[] = [];

        // which mutations is the caller interested in?
        mutationNames.forEach((mutationName) => {
            unsubs.push(this._registerExtensionForMutation(mutationName, extension));
        });

        // make it easy to unsubscribe in the future
        return () => {
            unsubs.forEach((unsub) => unsub());
        }
    }

    /**
     * `_registerExtensionForMutation()` associates your `extension`
     * with a single `mutationName`.
     *
     * We send back a function that you can call if you never need to
     * unsubscribe your `extension`.
     *
     * @param mutationName
     * the class name of the mutation that you want to be notified about
     * @param extension
     * the extension that wants to be notified whenever the Store sees
     * a mutation with the class name `mutationName`.
     * @returns
     * a function that you can call when you want to unsubscribe your
     * extension
     */
    private _registerExtensionForMutation(
        mutationName: string,
        extension: E
    ): ExtensionUnsubscriber {
        // add it to the list
        this._extensions[mutationName].push(extension);

        // we need to tell the caller how to unsubscribe
        return( () => {
            const index = this._extensions[mutationName].indexOf(extension);
            if (index > -1) {
                this._extensions[mutationName].splice(index, 1);
            }
        });
    }

    /**
     * `forEach()` will call your `fn` for each extension that is interested
     * in `mutation`.
     *
     * @param mutation
     * Which mutation do we want to find extensions for?
     * @param fn
     * We will call this callback every time we find an extension that has
     * registered for this mutation.
     * @returns
     * - `true` if at least one extension was called
     * - `false` otherwise
     */
    public forEach(
        mutation: M,
        fn: (extension: E) => void
    ): boolean
    {
        // shorthand
        const mutationNames = getClassNames(mutation);

        // keep track of what happened
        let extensionCalled = false;

        mutationNames.forEach((name) => {
            // shorthand
            //
            // we take a copy of the extensions, in case any of them
            // decide to unsubscribe themselves
            const extensions = (this._extensions[name] ?? []).slice();

            extensions.forEach((extension) => {
                extensionCalled = true;
                fn(extension);
            });
        });

        // all done
        return extensionCalled;
    }
}