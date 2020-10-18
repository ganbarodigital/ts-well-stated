//
// Copyright (c) 2020-present Ganbaro Digital Ltd
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public
// License along with this program. If not, see
// <https://www.gnu.org/licenses/>.
//
import {
    AppError,
    AppErrorData,
    makeHttpStatusCode,
    makeStructuredProblemReport,
} from "@safelytyped/core-types";

import { MODULE_NAME } from "../defaults/MODULE_NAME";
import { UnhandledMutationData } from "./UnhandledMutationData";

/**
 * `UnhandledMutationError` is a throwable Error. It is thrown whenever
 * the Store has been asked to process a mutation that it has no registered
 * mutation handlers for.
 *
 * @category Errors
 */
export class UnhandledMutationError extends AppError<UnhandledMutationData> {
    public constructor(params: UnhandledMutationData & AppErrorData) {
        const spr = makeStructuredProblemReport<UnhandledMutationData>({
            definedBy: MODULE_NAME,
            description: "store has no registered handlers for mutation",
            errorId: params.errorId,
            extra: {
                logsOnly: params.logsOnly,
            },
            status: makeHttpStatusCode(500),
        });

        super(spr);
    }
}