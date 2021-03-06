import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelApi, formComponentWithLabelFields } from './FormComponent';

export interface InputApi extends FormComponentWithLabelApi {
  type: 'input';
  inputMode?: string;
  placeholder?: string;
  maximized?: boolean;
  disabled?: boolean;
}

export interface Input extends FormComponentWithLabel {
  type: 'input';
  inputMode: Optional<string>;
  placeholder: Optional<string>;
  maximized: boolean;
  disabled: boolean;
}

const inputFields = formComponentWithLabelFields.concat([
  FieldSchema.optionString('inputMode'),
  FieldSchema.optionString('placeholder'),
  FieldSchema.defaultedBoolean('maximized', false),
  FieldSchema.defaultedBoolean('disabled', false)
]);

export const inputSchema = ValueSchema.objOf(inputFields);

export const inputDataProcessor = ValueSchema.string;

export const createInput = (spec: InputApi): Result<Input, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<Input>('input', inputSchema, spec);
