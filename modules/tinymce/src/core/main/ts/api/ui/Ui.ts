/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  PublicInlineContent as InlineContent, PublicMenu as Menu, PublicSidebar as Sidebar, PublicToolbar as Toolbar, PublicTypes as Dialog,
  Registry as BridgeRegistry
} from '@ephox/bridge';

type Registry = BridgeRegistry.Registry;

export {
  Registry,
  Dialog,
  InlineContent,
  Menu,
  Sidebar,
  Toolbar
};
