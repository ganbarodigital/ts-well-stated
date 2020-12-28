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
import { AppErrorOr } from "@safelytyped/core-types";
import { DateTime } from "luxon";

import { AnyMutation } from "../Mutations";
import { AnyState } from "../State";
import { ObservableEvent, StoreObserver } from "../StoreObserver";
import { Changelog } from "./Changelog";
import { ChangelogEntry } from "./ChangelogEntry";

/**
 * `InMemoryChangelog` is a simple {@link StoreObserver}. It keeps a
 * list of all {@link ObservableEvent}s that it has seen.
 *
 * Use it for unit testing and debugging purposes.
 */
export class InMemoryChangelog<ST extends AnyState, M extends AnyMutation>
implements Changelog<ST, M>, StoreObserver<ST,M>
{
    /**
     * `_theLog` holds our list of observered changes.
     */
    protected _theLog: ChangelogEntry<ST, M>[] = [];

    /**
     * `beforeMutationApplied()` is called by a {@link Store} to tell us
     * that the given `mutation` is about to be applied.
     *
     * @param event
     * details about the mutation that is about to be applied
     */
    public beforeMutationApplied(
        mutation: M,
        initialState: ST
    ) {
        const event: ObservableEvent<ST,M> = {
            mutation,
            initialState,
            outcome: initialState,
            createdAt: DateTime.utc().toJSDate()
        }
        this._theLog.push(event);

        return (outcome: AppErrorOr<ST>) => {
            event.outcome = outcome;
            event.completedAt = DateTime.utc().toJSDate();
        }
    }

    /**
     * `truncate()` resets our in-memory changelog. Useful for freeing
     * up memory!
     */
    public truncate()
    {
        this._theLog = [];
    }

    /**
     * `toJson()` returns our in-memory changelog as a JSON string.
     */
    public toJson()
    {
        return JSON.stringify(this._theLog);
    }

    /**
     * `.log` gives you access to our in-memory changelog.
     */
    public get log()
    {
        return this._theLog;
    }
}