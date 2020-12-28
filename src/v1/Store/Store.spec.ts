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

import { expect } from "chai";
import { describe } from "mocha";

import { Store } from ".";
import { UnhandledMutationError } from "../Errors";
import { MutationHandler } from "../Mutations";
import { StoreGuarantee } from "../StoreGuarantees";
import { StoreObserver } from "../StoreObserver";
import { StoreSubscriber } from "../StoreSubscriber";

import { isUnitTestStateA, MutationA, MutationB, UnitTestMutation, UnitTestState, UnitTestStateA, UnitTestStore } from "../_fixtures/UnitTestStore";

describe("Store", () => {
    describe(".constructor()", () => {
        it("creates a new Store", () => {
            const unit = new UnitTestStore(
                {
                    args: {}
                }
            );

            expect(unit).to.be.instanceOf(Store);
        });

        it("new Store starts with no guarantees", () => {
            const unit = new Store({});

            expect(unit.guarantees.length).to.eql(0);
        });

        it("new Store starts with no handlers", () => {
            const unit = new Store({});

            expect(unit.handlers.length).to.eql(0);
        });

        it("new Store starts with no observers", () => {
            const unit = new Store({});

            expect(unit.observers.length).to.eql(0);
        });

        it("new Store starts with no subscribers", () => {
            const unit = new Store({});

            expect(unit.subscribers.length).to.eql(0);
        });
    });

    describe(".apply()", () => {
        it("calls the observers, then guarantees, handlers, subscribers, then the observers' callbacks", () => {
            // --------------------------------------------------------------
            // setup your test

            const testMutation = new MutationA({
                available: true,
            });

            // we need to track the order that everything was called in
            let calledOrder = 1;
            let observer1Called = 0;
            let guarantee1Called = 0;
            let handler1Called = 0;
            let subscriber1Called = 0;
            let observed1Called = 0;

            const observer1: StoreObserver<UnitTestState, UnitTestMutation> = {
                beforeMutationApplied: (mutation, initialState) => {
                    observer1Called = calledOrder;
                    calledOrder++;

                    return (outcome) => {
                        observed1Called = calledOrder;
                        calledOrder++;
                    }
                }
            }

            const guarantee1: StoreGuarantee<UnitTestState, UnitTestMutation> = (
                mutation,
                state
            ) => {
                guarantee1Called = calledOrder;
                calledOrder++;
            }

            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation,
                state,
                store
            ) => {
                handler1Called = calledOrder;
                calledOrder++;
            }

            const subscriber1: StoreSubscriber<UnitTestState, UnitTestMutation> = (
                mutation,
                state,
                store
            ) => {
                subscriber1Called = calledOrder;
                calledOrder++;
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.guarantees.add(guarantee1, "MutationA");
            unit.handlers.add(handler1, "MutationA");
            unit.subscribers.add(subscriber1, "MutationA");
            unit.observers.add(observer1, "MutationA");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(testMutation);

            // --------------------------------------------------------------
            // test the results

            expect(observer1Called).to.equal(1);
            expect(guarantee1Called).to.equal(2);
            expect(handler1Called).to.equal(3);
            expect(subscriber1Called).to.equal(4);
            expect(observed1Called).to.equal(5);

        });

        it("mutation handlers can update the Store's state", () => {
            // --------------------------------------------------------------
            // setup your test

            // our first handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("only calls mutation handlers that are registered to receive the given mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const handler2: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.available = false;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.handlers.add(handler2, "MutationA");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("throws an UnhandledMutationError if there are no mutation handlers registered for the given mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            const observer1: StoreObserver<UnitTestState, UnitTestMutation> = {
                beforeMutationApplied: (mutation, initialState) => {
                    return (outcome) => {
                        // do nothing
                    }
                }
            }

            const guarantee1: StoreGuarantee<UnitTestState, UnitTestMutation> = (
                mutation,
                state
            ) => {
                // do nothing
            }

            const subscriber1: StoreSubscriber<UnitTestState, UnitTestMutation> = (
                mutation,
                state,
                store
            ) => {
                // do nothing
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.guarantees.add(guarantee1, "MutationB");
            unit.subscribers.add(subscriber1, "MutationB");
            unit.observers.add(observer1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            let caughtError;

            try {
                unit.apply(new MutationB({
                    dryRun: true
                }));
            } catch (e) {
                caughtError = e;
            }

            // --------------------------------------------------------------
            // test the results

            expect(caughtError).to.be.instanceOf(UnhandledMutationError);
        });

        it("passes a copy of the Store's state into observers", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1Called = false;
            const observer1: StoreObserver<UnitTestState, UnitTestMutation> = {
                beforeMutationApplied: (mutation, initialState) => {
                    // prove we were called
                    observer1Called = true;

                    // try to set the state in the observer
                    const state = initialState as UnitTestStateA;
                    state.args.available = true;

                    return (outcome) => {
                        // do nothing
                    }
                }
            }

            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.observers.add(observer1, "MutationB");
            unit.handlers.add(handler1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(observer1Called).to.equal(true);
            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("passes a copy of the Store's state into guarantees", () => {
            // --------------------------------------------------------------
            // setup your test

            let guarantee1Called = false;
            const guarantee1: StoreGuarantee<UnitTestState, UnitTestMutation> = (
                mutation,
                state
            ) => {
                if (isUnitTestStateA(state)) {
                    // prove we were called
                    guarantee1Called = true;

                    // change the state
                    // this will NOT show up at the end of the test
                    state.args.available = true;
                }
            }

            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.guarantees.add(guarantee1, "MutationB");
            unit.handlers.add(handler1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(guarantee1Called).to.equal(true);
            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("passes the Store's live state into mutation handlers", () => {
            // --------------------------------------------------------------
            // setup your test

            // our first handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            // our second handler inspects the state of the Store, and
            // proves to us that it has been given the live state rather
            // than a copy of the initial state
            let dryRunValue : boolean|null|undefined = null;
            const handler2: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // if `state` is the actual state of the Store, `dryRun`
                // will have a value
                if (isUnitTestStateA(state)) {
                    dryRunValue = state.args.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.handlers.add(handler2, "Object");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(dryRunValue).to.eql(true);
            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("passes the Store's live state into subscribers", () => {
            // --------------------------------------------------------------
            // setup your test

            // our handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            // our subscriber inspects the state of the Store, and
            // proves to us that it has been given the live state rather
            // than a copy of the initial state
            let dryRunValue : boolean|null|undefined = null;
            const subscriber1: StoreSubscriber<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // if `state` is the actual state of the Store, `dryRun`
                // will have a value
                if (isUnitTestStateA(state)) {
                    dryRunValue = state.args.dryRun;
                    state.args.available = true;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.subscribers.add(subscriber1, "Object");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(dryRunValue).to.eql(true);
            expect(unit.state).to.eql({
                args: {
                    available: true,
                    dryRun: true
                }
            });
        });

        it("passes a copy of the Store's state into observers' callbacks", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1Called = false;
            const observer1: StoreObserver<UnitTestState, UnitTestMutation> = {
                beforeMutationApplied: (event) => {
                    return (outcome) => {
                        // prove we were called
                        observer1Called = true;

                        // try to set the state in the observer
                        const state = outcome as UnitTestStateA;
                        state.args.available = true;
                        // do nothing
                    }
                }
            }

            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.observers.add(observer1, "MutationB");
            unit.handlers.add(handler1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            unit.apply(new MutationB({
                dryRun: true
            }));

            // --------------------------------------------------------------
            // test the results

            expect(observer1Called).to.equal(true);
            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });

        it("does not call the mutation handlers if a guarantee throws an Error", () => {
            // --------------------------------------------------------------
            // setup your test

            const guarantee1: StoreGuarantee<UnitTestState, UnitTestMutation> = (
                mutation
            ) => {
                throw new Error("do not proceeed!");
            }

            // our handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.guarantees.add(guarantee1, "Object");
            unit.handlers.add(handler1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            let caughtException;

            try {
                unit.apply(new MutationB({
                    dryRun: true
                }));
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            expect(caughtException).to.be.instanceOf(Error);
            expect(unit.state).to.eql({
                args: {}
            });
        });

        it("rolls back any state changes if any mutation handler throws an Error", () => {
            // --------------------------------------------------------------
            // setup your test

            let handler1Called = false;

            // our handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    handler1Called = true;
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const handler2: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation,
                state
            ) => {
                throw new Error("you must rollback!");
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.handlers.add(handler2, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            let caughtException;

            try {
                unit.apply(new MutationB({
                    dryRun: true
                }));
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            // prove that we made the change to the state
            expect(handler1Called).to.eql(true);

            // prove that the second handler bugged out
            expect(caughtException).to.be.instanceOf(Error);

            // prove that the Store's state is unchanged
            expect(unit.state).to.eql({
                args: {}
            });
        });

        it("rolls back any state changes if any subscriber throws an Error", () => {
            // --------------------------------------------------------------
            // setup your test

            let handler1Called = false;

            // our handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    handler1Called = true;
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const subscriber1: StoreSubscriber<UnitTestState, UnitTestMutation> = (
                mutation,
                state
            ) => {
                throw new Error("you must rollback!");
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.subscribers.add(subscriber1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            let caughtException;

            try {
                unit.apply(new MutationB({
                    dryRun: true
                }));
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            // prove that we made the change to the state
            expect(handler1Called).to.eql(true);

            // prove that the second handler bugged out
            expect(caughtException).to.be.instanceOf(Error);

            // prove that the Store's state is unchanged
            expect(unit.state).to.eql({
                args: {}
            });
        });

        it("does not roll back any state changes if any observer throws an Error", () => {
            // --------------------------------------------------------------
            // setup your test

            let handler1Called = false;

            // our handler changes the state of the Store
            const handler1: MutationHandler<UnitTestState, UnitTestMutation> = (
                mutation: UnitTestMutation,
                state
            ) => {
                // guarantee
                if (! (mutation instanceof MutationB)) {
                    return;
                }

                if (isUnitTestStateA(state)) {
                    handler1Called = true;
                    state.args.dryRun = mutation.data.dryRun;
                }
            }

            const observer1: StoreObserver<UnitTestState, UnitTestMutation> = {
                beforeMutationApplied: (event) => {
                    // we want the callback to throw the Error
                    return () => {
                        throw new Error("you must rollback!");
                    }
                }
            }

            const unit = new UnitTestStore({
                args: {}
            });
            unit.handlers.add(handler1, "MutationB");
            unit.observers.add(observer1, "MutationB");

            // --------------------------------------------------------------
            // perform the change

            let caughtException;

            try {
                unit.apply(new MutationB({
                    dryRun: true
                }));
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            // prove that we made the change to the state
            expect(handler1Called).to.eql(true);

            // prove that the second handler bugged out
            expect(caughtException).to.be.instanceOf(Error);

            // prove that the Store's state is unchanged
            expect(unit.state).to.eql({
                args: {
                    dryRun: true
                }
            });
        });
    });

    describe(".state", () => {
        it("returns the current state of the Store", () => {
            // --------------------------------------------------------------
            // setup your test

            const expectedValue = {
                args: {
                    available: true
                }
            }

            const unit = new UnitTestStore(expectedValue);

            // --------------------------------------------------------------
            // perform the change

            const actualValue = unit.state;

            // --------------------------------------------------------------
            // test the results

            expect(actualValue).to.eql(expectedValue);
        });
    })
});