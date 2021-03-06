/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { ResizeBehaviour, ResizeWire, Sizes, TableDirection, TableResize } from '@ephox/snooker';
import { Css, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import * as Util from '../core/Util';
import * as Direction from '../queries/Direction';
import * as TableSize from '../queries/TableSize';
import { enforcePercentage, enforcePixels, syncPixels } from './EnforceUnit';
import * as TableWire from './TableWire';

export interface ResizeHandler {
  lazyResize: () => Optional<TableResize>;
  lazyWire: () => any;
  destroy: () => void;
}

export const getResizeHandler = function (editor: Editor): ResizeHandler {
  let selectionRng = Optional.none<Range>();
  let resize = Optional.none<TableResize>();
  let wire = Optional.none();
  let startW: number;
  let startRawW: string;

  const isTable = function (elm: Node): elm is HTMLTableElement {
    return elm.nodeName === 'TABLE';
  };

  const lazyResize = function () {
    return resize;
  };

  const lazyWire = function () {
    return wire.getOr(ResizeWire.only(SugarElement.fromDom(editor.getBody())));
  };

  const destroy = function () {
    resize.each(function (sz) {
      sz.destroy();
    });

    wire.each(function (w) {
      TableWire.remove(editor, w);
    });
  };

  editor.on('init', function () {
    const direction = TableDirection(Direction.directionAt);
    const rawWire = TableWire.get(editor);
    wire = Optional.some(rawWire);
    if (Settings.hasObjectResizing(editor) && Settings.hasTableResizeBars(editor)) {
      const lazySizing = (table: SugarElement<HTMLTableElement>) => TableSize.get(editor, table);
      const resizing = Settings.getColumnResizingBehaviour(editor) === 'resizetable' ? ResizeBehaviour.resizeTable() : ResizeBehaviour.preserveTable();
      const sz = TableResize.create(rawWire, direction, resizing, lazySizing);
      sz.on();
      sz.events.startDrag.bind(function (_event) {
        selectionRng = Optional.some(editor.selection.getRng());
      });

      sz.events.beforeResize.bind(function (event) {
        const rawTable = event.table().dom();
        Events.fireObjectResizeStart(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable));
      });

      sz.events.afterResize.bind(function (event) {
        const table = event.table();
        const rawTable = table.dom();
        Util.removeDataStyle(table);

        selectionRng.each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
        });

        Events.fireObjectResized(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable));
        editor.undoManager.add();
      });

      resize = Optional.some(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', function (e) {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = SugarElement.fromDom(targetElm);

      if (!Sizes.isPixelSizing(table) && Settings.isPixelsForced(editor)) {
        enforcePixels(editor, table);
      } else if (!Sizes.isPercentSizing(table) && Settings.isPercentagesForced(editor)) {
        enforcePercentage(editor, table);
      }

      startW = e.width;
      startRawW = Util.getRawWidth(editor, targetElm).getOr('');
    }
  });

  editor.on('ObjectResized', function (e) {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = SugarElement.fromDom(targetElm);

      if (startRawW === '' || (!Util.isPercentage(startRawW) && Settings.isResponsiveForced(editor))) {
        // Responsive tables don't have a width so we need to convert it to a relative/percent
        // table instead, as that's closer to responsive sizing than fixed sizing
        enforcePercentage(editor, table);
      } else if (Util.isPercentage(startRawW)) {
        const percentW = parseFloat(startRawW.replace('%', ''));
        const targetPercentW = e.width * percentW / startW;
        Css.set(table, 'width', targetPercentW + '%');
      } else {
        syncPixels(table);
      }
      Util.removeDataStyle(table);
    }
  });

  editor.on('SwitchMode', () => {
    lazyResize().each(function (resize) {
      if (editor.mode.isReadOnly()) {
        resize.hideBars();
      } else {
        resize.showBars();
      }
    });
  });

  return {
    lazyResize,
    lazyWire,
    destroy
  };
};
