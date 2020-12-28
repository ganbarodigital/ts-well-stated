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
import { UnhandledMutationError } from "../Errors";

import {
    MutationA,
    UnitTestMutation,
    UnitTestMutationHandler,
    UnitTestState,
    UnitTestStore,
} from "../_fixtures/UnitTestStore";
import { MutationHandlers } from "./MutationHandlers";

describe("MutationHandlers", () => {
    it("is a WatchList", () => {
        // ----------------------------------------------------------------
        // setup your test

        // ----------------------------------------------------------------
        // perform the change

        const unit = new MutationHandlers();

        // ----------------------------------------------------------------
        // test the results

        expect(unit).to.be.instanceOf(WatchList);
    });

    describe(".apply() (static)", () => {
        it("calls every handler that is registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let handler1Called = false;
            const handler1: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler1Called = true;
            }

            let handler2Called = false;
            const handler2: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler2Called = true;
            }

            let handler3Called = false;
            const handler3: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler3Called = true;
            }

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();
            unit.add(handler1, "MutationA");
            unit.add(handler2, "MutationA");
            unit.add(handler3, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            MutationHandlers.apply(
                unit,
                new MutationA({
                    available: true
                }),
                store.state,
                store
            );

            // --------------------------------------------------------------
            // test the results

            expect(handler1Called).to.equal(true);
            expect(handler2Called).to.equal(true);
            expect(handler3Called).to.equal(true);
        });

        it("only calls handlers that are registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let handler1Called = false;
            const handler1: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler1Called = true;
            }

            let handler2Called = false;
            const handler2: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler2Called = true;
            }

            let handler3Called = false;
            const handler3: UnitTestMutationHandler = (
                mutation,
                state
            ) => {
                handler3Called = true;
            }

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();
            unit.add(handler1, "MutationA");
            unit.add(handler2, "MutationA");
            unit.add(handler3, "MutationB");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            MutationHandlers.apply(
                unit,
                new MutationA({
                    available: true
                }),
                store.state,
                store
            );

            // --------------------------------------------------------------
            // test the results

            expect(handler1Called).to.equal(true);
            expect(handler2Called).to.equal(true);
            expect(handler3Called).to.equal(false);
        });

        it("passes an optional error callback into the handlers", () => {
            // --------------------------------------------------------------
            // setup your test

            let myErrorHandlerCalled = false;

            const myErrorHandler = (err: AnyAppError): never => {
                myErrorHandlerCalled = true;
                throw err;
            };

            const handler1: UnitTestMutationHandler = (
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

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();
            unit.add(handler1, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            let caughtException;
            try {
                MutationHandlers.apply(
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

        it("throwns an UnhandledMutationError if no handlers called", () => {
            // --------------------------------------------------------------
            // setup your test

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            let caughtException;
            try {
                MutationHandlers.apply(
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

            expect(caughtException).to.be.instanceOf(UnhandledMutationError);
        });

        it("accepts an optional 'unhandled mutation' callback", () => {
            // --------------------------------------------------------------
            // setup your test

            let myErrorHandlerCalled = false;

            const myErrorHandler = (err: AnyAppError): never => {
                myErrorHandlerCalled = true;
                throw err;
            };

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            try {
                MutationHandlers.apply(
                    unit,
                    new MutationA({
                        available: true
                    }),
                    store.state,
                    store,
                    {
                        onUnhandledMutation: myErrorHandler
                    }
                );
            } catch (e) {
                // do nothing
            }

            // --------------------------------------------------------------
            // test the results

            expect(myErrorHandlerCalled).to.equal(true);
        });

        it("the optional 'unhandled mutation' callback can simply return", () => {
            // --------------------------------------------------------------
            // setup your test

            let myErrorHandlerCalled = false;

            const myErrorHandler = (err: AnyAppError): void => {
                myErrorHandlerCalled = true;
            };

            const unit = new MutationHandlers<UnitTestState, UnitTestMutation>();

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            MutationHandlers.apply(
                unit,
                new MutationA({
                    available: true
                }),
                store.state,
                store,
                {
                    onUnhandledMutation: myErrorHandler
                }
            );

            // --------------------------------------------------------------
            // test the results

            expect(myErrorHandlerCalled).to.equal(true);
        });
    });
});