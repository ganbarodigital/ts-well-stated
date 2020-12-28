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
import { AnyAppError, UnreachableCodeError } from "@safelytyped/core-types";
import { WatchList } from "@safelytyped/well-watched";
import { expect } from "chai";
import { describe } from "mocha";

import {
    MutationA,
    UnitTestMutation,
    UnitTestStoreSubscriber,
    UnitTestState,
    UnitTestStore,
} from "../_fixtures/UnitTestStore";
import { StoreSubscribers } from "./StoreSubscribers";

describe("StoreSubscribers", () => {
    it("is a WatchList", () => {
        // ----------------------------------------------------------------
        // setup your test

        // ----------------------------------------------------------------
        // perform the change

        const unit = new StoreSubscribers();

        // ----------------------------------------------------------------
        // test the results

        expect(unit).to.be.instanceOf(WatchList);
    });

    describe(".notify() (static)", () => {
        it("calls every subscriber that is registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let subscriber1Called = false;
            const subscriber1: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber1Called = true;
            }

            let subscriber2Called = false;
            const subscriber2: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber2Called = true;
            }

            let subscriber3Called = false;
            const subscriber3: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber3Called = true;
            }

            const unit = new StoreSubscribers<UnitTestState, UnitTestMutation>();
            unit.add(subscriber1, "MutationA");
            unit.add(subscriber2, "MutationA");
            unit.add(subscriber3, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            StoreSubscribers.notify(
                unit,
                new MutationA({
                    available: true
                }),
                store.state,
                store
            );

            // --------------------------------------------------------------
            // test the results

            expect(subscriber1Called).to.equal(true);
            expect(subscriber2Called).to.equal(true);
            expect(subscriber3Called).to.equal(true);
        });

        it("only calls subscribers that are registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let subscriber1Called = false;
            const subscriber1: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber1Called = true;
            }

            let subscriber2Called = false;
            const subscriber2: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber2Called = true;
            }

            let subscriber3Called = false;
            const subscriber3: UnitTestStoreSubscriber = (
                mutation,
                state
            ) => {
                subscriber3Called = true;
            }

            const unit = new StoreSubscribers<UnitTestState, UnitTestMutation>();
            unit.add(subscriber1, "MutationA");
            unit.add(subscriber2, "MutationA");
            unit.add(subscriber3, "MutationB");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            StoreSubscribers.notify(
                unit,
                new MutationA({
                    available: true
                }),
                store.state,
                store
            );

            // --------------------------------------------------------------
            // test the results

            expect(subscriber1Called).to.equal(true);
            expect(subscriber2Called).to.equal(true);
            expect(subscriber3Called).to.equal(false);
        });

        it("passes an optional error callback into the subscribers", () => {
            // --------------------------------------------------------------
            // setup your test

            let myErrorHandlerCalled = false;

            const myErrorHandler = (err: AnyAppError): never => {
                myErrorHandlerCalled = true;
                throw err;
            };

            const subscriber1: UnitTestStoreSubscriber = (
                mutation,
                state,
                // tslint:disable-next-line: no-shadowed-variable
                store,
                options
            ) => {
                options.onError(new UnreachableCodeError({
                    public: {
                        reason: "unit test example"
                    }
                }));
            }

            const unit = new StoreSubscribers<UnitTestState, UnitTestMutation>();
            unit.add(subscriber1, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            let caughtException;
            try {
                StoreSubscribers.notify(
                    unit,
                    new MutationA({
                        available: true
                    }),
                    store.state,
                    store,
                    {
                        onError: myErrorHandler
                    }
                );
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            expect(myErrorHandlerCalled).to.equal(true);
            expect(caughtException).to.be.instanceOf(UnreachableCodeError);
        });

        it("throws nothing if no subscribers are called", () => {
            // --------------------------------------------------------------
            // setup your test

            const unit = new StoreSubscribers<UnitTestState, UnitTestMutation>();

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            let caughtException;
            try {
                StoreSubscribers.notify(
                    unit,
                    new MutationA({
                        available: true
                    }),
                    store.state,
                    store
                );
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            expect(caughtException).to.eql(undefined);
        });
    });
});