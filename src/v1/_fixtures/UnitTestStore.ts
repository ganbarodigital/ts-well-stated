// tslint:disable: max-classes-per-file
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

import { Mutation, MutationHandler } from "../Mutations";
import { Store } from "../Store";
import { StoreGuarantee } from "../StoreGuarantees";
import { StoreObserver } from "../StoreObserver";
import { StoreSubscriber } from "../StoreSubscriber";


export interface UnitTestStateA {
    args: {
        available?: boolean;
        dryRun?: boolean;
    }
}

export function isUnitTestStateA(input: object): input is UnitTestStateA {
    return (input as UnitTestStateA).args !== undefined;
}

export interface UnitTestStateB {
    config: {
        rootFolder: string;
    }
}

export interface UnitTestStateC {
    args: {
        available?: boolean;
        dryRun: boolean;
    },
    config?: {
        rootFolder: string;
    }
}

export interface UnitTestStateD {
    args: {
        available: boolean;
        dryRun?: boolean;
    },
    config?: {
        rootFolder: string;
    }
}

export interface UnitTestStateE {
    args: {
        available: boolean;
        dryRun: boolean;
    },
    config?: {
        rootFolder: string;
    }
}

export type UnitTestState = UnitTestStateA
    | UnitTestStateB
    | UnitTestStateC
    | UnitTestStateD
    | UnitTestStateE;

export interface MutationAData {
    available: boolean;
}
export class MutationA extends Mutation<MutationAData> {}

export interface MutationBData {
    dryRun: boolean;
}

export class MutationB extends Mutation<MutationBData> {}

export interface MutationCData {
    rootFolder: string;
}
export class MutationC extends Mutation<MutationCData> {}

export type UnitTestMutation = MutationA
    | MutationB
    | MutationC;

export class UnitTestStore extends Store<
    UnitTestState,
    UnitTestMutation
> {}

export type UnitTestMutationHandler = MutationHandler<UnitTestState, UnitTestMutation>;

export type UnitTestStoreGuarantee = StoreGuarantee<UnitTestState, UnitTestMutation>;

export type UnitTestStoreObserver = StoreObserver<UnitTestState, UnitTestMutation>;

export type UnitTestStoreSubscriber = StoreSubscriber<UnitTestState, UnitTestMutation>;