import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Optional, Result } from '@ephox/katamari';
import { BaseToolbarButton, BaseToolbarButtonSpec, baseToolbarButtonFields, BaseToolbarButtonInstanceApi } from './ToolbarButton';
import {
  BaseToolbarToggleButton, BaseToolbarToggleButtonSpec, baseToolbarToggleButtonFields, BaseToolbarToggleButtonInstanceApi
} from './ToolbarToggleButton';

export type ContextToolbarPosition = 'node' | 'selection' | 'line';
export type ContextScope = 'node' | 'editor';

interface ContextBarSpec {
  predicate?: (elem: Element) => boolean;
  position?: ContextToolbarPosition;
  scope?: ContextScope;
}

interface ContextBar {
  predicate: (elem: Element) => boolean;
  position: ContextToolbarPosition;
  scope: ContextScope;
}

// tslint:disable-next-line:no-empty-interface
export interface ContextButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

// tslint:disable-next-line:no-empty-interface
export interface ContextToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export interface ContextButtonSpec extends BaseToolbarButtonSpec<ContextButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, api: ContextButtonInstanceApi) => void;
}

export interface ContextFormLaunchButtonApi extends BaseToolbarButtonSpec<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchButton extends BaseToolbarButton<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchToggleButtonSpec extends BaseToolbarToggleButtonSpec<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextFormLaunchToggleButton extends BaseToolbarToggleButton<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextToggleButtonSpec extends BaseToolbarToggleButtonSpec<ContextToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextToggleButtonInstanceApi) => void;
  primary?: boolean;
}

export interface ContextButton extends BaseToolbarButton<ContextButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextButtonInstanceApi) => void;
  original: ContextButtonSpec;
}

export interface ContextToggleButton extends BaseToolbarToggleButton<ContextToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextToggleButtonInstanceApi) => void;
  original: ContextToggleButtonSpec;
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  items: string;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string;
}

export interface ContextFormInstanceApi {
  hide: () => void;
  getValue: () => string; // Maybe we need to support other data types?
}

export interface ContextFormSpec extends ContextBarSpec {
  type?: 'contextform';
  initValue?: () => string;
  label?: string;
  launch?: ContextFormLaunchButtonApi | ContextFormLaunchToggleButtonSpec;
  commands: Array<ContextToggleButtonSpec | ContextButtonSpec>;
}

export interface ContextForm extends ContextBar {
  type: 'contextform';
  initValue: () => string;
  label: Optional<string>;
  launch: Optional<ContextFormLaunchButton | ContextFormLaunchToggleButton>;
  commands: Array<ContextToggleButton | ContextButton>;
}

const contextBarFields = [
  FieldSchema.defaultedFunction('predicate', () => false),
  FieldSchema.defaultedStringEnum('scope', 'node', [ 'node', 'editor' ]),
  FieldSchema.defaultedStringEnum('position', 'selection', [ 'node', 'selection', 'line' ])
];

const contextButtonFields = baseToolbarButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton'),
  FieldSchema.defaulted('primary', false),
  FieldSchema.strictFunction('onAction'),
  FieldSchema.state('original', Fun.identity)
]);

const contextToggleButtonFields = baseToolbarToggleButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton'),
  FieldSchema.defaulted('primary', false),
  FieldSchema.strictFunction('onAction'),
  FieldSchema.state('original', Fun.identity)
]);

const launchButtonFields = baseToolbarButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformbutton')
]);

const launchToggleButtonFields = baseToolbarToggleButtonFields.concat([
  FieldSchema.defaulted('type', 'contextformtogglebutton')
]);

const toggleOrNormal = ValueSchema.choose('type', {
  contextformbutton: contextButtonFields,
  contextformtogglebutton: contextToggleButtonFields
});

const contextFormSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contextform'),
  FieldSchema.defaultedFunction('initValue', () => ''),
  FieldSchema.optionString('label'),
  FieldSchema.strictArrayOf('commands', toggleOrNormal),
  FieldSchema.optionOf('launch', ValueSchema.choose('type', {
    contextformbutton: launchButtonFields,
    contextformtogglebutton: launchToggleButtonFields
  }))
].concat(contextBarFields));

const contextToolbarSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contexttoolbar'),
  FieldSchema.strictString('items')
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);

export const createContextForm = (spec: ContextFormSpec): Result<ContextForm, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ContextForm>('ContextForm', contextFormSchema, spec);
