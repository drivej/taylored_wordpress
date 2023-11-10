interface IFieldConfig<DataType = string | number, InputData = Record<string, string | number>> {
  name: string;
  defaultValue?: DataType;
  render(input: InputData, config: IFieldConfig<DataType, InputData>): DataType;
}

const FieldRenderers: Record<string, IFieldConfig['render']> = {
  basic: (input, config) => input?.[config.name]
};

// export class FieldImporter<DataType, InputData> {
//   config: IFieldConfig<DataType, InputData>;

//   constructor(config: IFieldConfig<Partial<DataType>, InputData>) {
//     this.config = { render: FieldRenderers.basic, defaultValue: null, ...config };
//   }

//   renderValue() {}
// }

export class Field {
  name = '';

  constructor(config: { name: string; getValue?: () => string }) {
    Object.assign(this, config);
  }

  getValue(input: Record<string, unknown>) {
    return input[this.name];
  }
}
