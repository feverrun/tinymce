import { ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface ColorInputSpec extends FormComponentWithLabelSpec {
  type: 'colorinput';
}

export interface ColorInput extends FormComponentWithLabel {
  type: 'colorinput';
}

const colorInputFields = formComponentWithLabelFields;

export const colorInputSchema = ValueSchema.objOf(colorInputFields);

export const colorInputDataProcessor = ValueSchema.string;

export const createInputBox = (spec: ColorInputSpec): Result<ColorInput, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ColorInput>('colorinput', colorInputSchema, spec);
