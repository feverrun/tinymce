/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { RunOperation, SimpleGenerators } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';
import { Selections } from '../selection/Selections';
import * as CellOperations from './CellOperations';

const noMenu = (cell: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Optional.none,
  unmergable: Optional.none,
  selection: Fun.constant([ cell ])
});

const forMenu = (selections: Selections, table: SugarElement<HTMLTableElement>, cell: SugarElement<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Fun.constant(CellOperations.mergable(table, selections)),
  unmergable: Fun.constant(CellOperations.unmergable(cell, selections)),
  selection: Fun.constant(CellOperations.selection(cell, selections))
});

const paste = (element: SugarElement<Element>, clipboard: SugarElement<HTMLTableElement>, generators: SimpleGenerators): RunOperation.TargetPaste => ({
  element: Fun.constant(element),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

const pasteRows = (selections: Selections, cell: SugarElement<HTMLTableCellElement>, clipboard: SugarElement<HTMLTableRowElement>[], generators: SimpleGenerators): RunOperation.TargetPasteRows => ({
  selection: Fun.constant(CellOperations.selection(cell, selections)),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

export { noMenu, forMenu, paste, pasteRows };

