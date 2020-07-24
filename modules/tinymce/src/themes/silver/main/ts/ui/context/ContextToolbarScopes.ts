/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Arr, Obj } from '@ephox/katamari';
import { ValueSchema } from '@ephox/boulder';
import { ContextTypes } from '../../ContextToolbar';

// Divide the defined toolbars into forms, node scopes, and editor scopes
export interface ScopedToolbars {
  forms: Record<string, Toolbar.ContextForm>; // run through Bridge.
  inNodeScope: Array<ContextTypes>;
  inEditorScope: Array<ContextTypes>;
  lookupTable: Record<string, ContextTypes>;
  formNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec>; // this stays API due to toolbar applying bridge
}

const categorise = (contextToolbars: Record<string, Toolbar.ContextFormSpec | Toolbar.ContextToolbarSpec>, navigate: (destForm: Toolbar.ContextForm) => void): ScopedToolbars => {

  // TODO: Use foldl/foldr and avoid as much mutation.
  const forms: Record<string, Toolbar.ContextForm> = { };
  const inNodeScope: Array<ContextTypes> = [ ];
  const inEditorScope: Array<ContextTypes> = [ ];
  const formNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec> = { };
  const lookupTable: Record<string, ContextTypes> = { };

  const registerForm = (key: string, toolbarSpec: Toolbar.ContextFormSpec) => {
    const contextForm = ValueSchema.getOrDie(Toolbar.createContextForm(toolbarSpec));
    forms[key] = contextForm;
    contextForm.launch.map((launch) => {
      // Use the original here (pre-boulder), because using as a the spec for toolbar buttons
      formNavigators['form:' + key + ''] = {
        ...toolbarSpec.launch,
        type: (launch.type === 'contextformtogglebutton' ? 'togglebutton' : 'button') as any,
        onAction: () => {
          navigate(contextForm);
        }
      };
    });

    if (contextForm.scope === 'editor') {
      inEditorScope.push(contextForm);
    } else {
      inNodeScope.push(contextForm);
    }

    lookupTable[key] = contextForm;
  };

  const registerToolbar = (key: string, toolbarSpec: Toolbar.ContextToolbarSpec) => {
    Toolbar.createContextToolbar(toolbarSpec).each((contextToolbar) => {
      if (toolbarSpec.scope === 'editor') {
        inEditorScope.push(contextToolbar);
      } else {
        inNodeScope.push(contextToolbar);
      }
      lookupTable[key] = contextToolbar;
    });
  };

  const keys = Obj.keys(contextToolbars);
  Arr.each(keys, (key) => {
    const toolbarApi = contextToolbars[key];
    // TS wouldn't really let me do the ternary I wanted :(
    if (toolbarApi.type === 'contextform') {
      registerForm(key, toolbarApi);
    } else if (toolbarApi.type === 'contexttoolbar') {
      registerToolbar(key, toolbarApi);
    }
  });

  return {
    forms,
    inNodeScope,
    inEditorScope,
    lookupTable,
    formNavigators
  };
};

export {
  categorise
};
