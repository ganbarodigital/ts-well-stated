// tslint:disable: no-empty no-shadowed-variable
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
import { AppErrorOr, UnreachableCodeError } from "@safelytyped/core-types";
import { WatchList } from "@safelytyped/well-watched";
import { expect } from "chai";
import { describe } from "mocha";

import {
    MutationA,
    UnitTestMutation,
    UnitTestStoreObserver,
    UnitTestState,
    UnitTestStore,
} from "../_fixtures/UnitTestStore";
import { StoreObservers } from "./StoreObservers";

describe("StoreObservers", () => {
    it("is a WatchList", () => {
        // ----------------------------------------------------------------
        // setup your test

        // ----------------------------------------------------------------
        // perform the change

        const unit = new StoreObservers();

        // ----------------------------------------------------------------
        // test the results

        expect(unit).to.be.instanceOf(WatchList);
    });

    describe(".prepare() (static)", () => {
        it("calls every observer that is registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1CalledBefore = false;
            let observer1CalledAfter = false;

            const observer1: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer1CalledBefore = true;
                    return () => {
                        observer1CalledAfter = true;
                    };
                },
            };

            let observer2CalledBefore = false;
            let observer2CalledAfter = false;

            const observer2: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer2CalledBefore = true;
                    return () => {
                        observer2CalledAfter = true;
                    };
                },
            };

            let observer3CalledBefore = false;
            let observer3CalledAfter = false;

            const observer3: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer3CalledBefore = true;
                    return () => {
                        observer3CalledAfter = true;
                    };
                },
            };

            const unit = new StoreObservers<UnitTestState, UnitTestMutation>();

            unit.add(observer1, "MutationA");
            unit.add(observer2, "MutationA");
            unit.add(observer3, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            StoreObservers.prepare(
                unit,
                new MutationA({
                    available: true
                }),
                store.state
            );

            // --------------------------------------------------------------
            // test the results

            expect(observer1CalledBefore).to.equal(true);
            expect(observer2CalledBefore).to.equal(true);
            expect(observer3CalledBefore).to.equal(true);

            expect(observer1CalledAfter).to.equal(false);
            expect(observer2CalledAfter).to.equal(false);
            expect(observer3CalledAfter).to.equal(false);
        });

        it("returns a callback to tell the observers what happened afterwards", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1CalledBefore = false;
            let observer1CalledAfter = false;

            const observer1: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer1CalledBefore = true;
                    return () => {
                        observer1CalledAfter = true;
                    };
                },
            };

            let observer2CalledBefore = false;
            let observer2CalledAfter = false;

            const observer2: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer2CalledBefore = true;
                    return () => {
                        observer2CalledAfter = true;
                    };
                },
            };

            let observer3CalledBefore = false;
            let observer3CalledAfter = false;

            const observer3: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer3CalledBefore = true;
                    return () => {
                        observer3CalledAfter = true;
                    };
                },
            };

            const unit = new StoreObservers<UnitTestState, UnitTestMutation>();

            unit.add(observer1, "MutationA");
            unit.add(observer2, "MutationA");
            unit.add(observer3, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            const updateOutcome = StoreObservers.prepare(
                unit,
                new MutationA({
                    available: true
                }),
                store.state
            );

            expect(observer1CalledBefore).to.equal(true);
            expect(observer2CalledBefore).to.equal(true);
            expect(observer3CalledBefore).to.equal(true);

            expect(observer1CalledAfter).to.equal(false);
            expect(observer2CalledAfter).to.equal(false);
            expect(observer3CalledAfter).to.equal(false);

            // --------------------------------------------------------------
            // perform the change

            updateOutcome({ args: { available: true }});

            // --------------------------------------------------------------
            // test the results

            expect(observer1CalledAfter).to.equal(true);
            expect(observer2CalledAfter).to.equal(true);
            expect(observer3CalledAfter).to.equal(true);
        });

        it("only calls guards that are registered for the mutation", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1CalledBefore = false;
            let observer1CalledAfter = false;

            const observer1: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer1CalledBefore = true;
                    return () => {
                        observer1CalledAfter = true;
                    };
                },
            };

            let observer2CalledBefore = false;
            let observer2CalledAfter = false;

            const observer2: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer2CalledBefore = true;
                    return () => {
                        observer2CalledAfter = true;
                    };
                },
            };

            let observer3CalledBefore = false;
            let observer3CalledAfter = false;

            const observer3: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    observer3CalledBefore = true;
                    return () => {
                        observer3CalledAfter = true;
                    };
                },
            };

            const unit = new StoreObservers<UnitTestState, UnitTestMutation>();

            unit.add(observer1, "MutationA");
            unit.add(observer2, "MutationA");
            unit.add(observer3, "MutationB");

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            const updateOutcome = StoreObservers.prepare(
                unit,
                new MutationA({
                    available: true
                }),
                store.state
            );

            expect(observer1CalledBefore).to.equal(true);
            expect(observer2CalledBefore).to.equal(true);
            expect(observer3CalledBefore).to.equal(false);

            expect(observer1CalledAfter).to.equal(false);
            expect(observer2CalledAfter).to.equal(false);
            expect(observer3CalledAfter).to.equal(false);

            updateOutcome({ args: { available: true }});

            // --------------------------------------------------------------
            // test the results

            expect(observer1CalledAfter).to.equal(true);
            expect(observer2CalledAfter).to.equal(true);
            expect(observer3CalledAfter).to.equal(false);
        });

        it("returns a callback that accepts an AppError", () => {
            // --------------------------------------------------------------
            // setup your test

            let observer1Parameter: AppErrorOr<UnitTestState> = {
                args: {}
            };

            const observer1: UnitTestStoreObserver = {
                beforeMutationApplied: (mutation, state) => {
                    return (outcome) => {
                        observer1Parameter = outcome;
                    };
                },
            };

            const unit = new StoreObservers<UnitTestState, UnitTestMutation>();

            unit.add(observer1, "MutationA");

            const store = new UnitTestStore({
                args: {}
            });

            const updateOutcome = StoreObservers.prepare(
                unit,
                new MutationA({
                    available: true
                }),
                store.state
            );

            const outcome = new UnreachableCodeError({
                public: {
                    reason: "Unit test"
                }
            });

            // --------------------------------------------------------------
            // perform the change

            updateOutcome(outcome);

            // --------------------------------------------------------------
            // test the results

            expect(observer1Parameter).to.equal(outcome);
        });

        it("throws nothing if no observers are called", () => {
            // --------------------------------------------------------------
            // setup your test

            const unit = new StoreObservers<UnitTestState, UnitTestMutation>();

            const store = new UnitTestStore({
                args: {}
            });

            // --------------------------------------------------------------
            // perform the change

            let caughtException;
            try {
                const updateOutcome = StoreObservers.prepare(
                    unit,
                    new MutationA({
                        available: true
                    }),
                    store.state
                );

                updateOutcome({ args: { available: true }});
            } catch (e) {
                caughtException = e;
            }

            // --------------------------------------------------------------
            // test the results

            expect(caughtException).to.eql(undefined);
        });
    });
});