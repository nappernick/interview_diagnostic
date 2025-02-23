import { v4 as uuidv4 } from "uuid";
import { DefaultNodeModel, DefaultNodeModelOptions, DefaultPortModel } from "@projectstorm/react-diagrams";

export interface CustomNodeOptions extends DefaultNodeModelOptions {
  type?: string;
  details?: string;
  annotation?: string;
  x?: number;
  y?: number;
  id?: string;
}

export class CustomNodeModel extends DefaultNodeModel {
  constructor(options: CustomNodeOptions) {
    if (!options.id) {
      options.id = uuidv4();
    }
    super(options);
    // Initialize ports
    this.addPort(new DefaultPortModel({ in: true, name: "in" }));
    this.addPort(new DefaultPortModel({ in: false, name: "out" }));
    if (typeof options.x === "number" && typeof options.y === "number") {
      this.setPosition(options.x, options.y);
    }
  }

  serialize() {
    const base = super.serialize();
    const opts = this.options as CustomNodeOptions;
    return {
      ...base,
      type: opts.type,
      details: opts.details,
      annotation: opts.annotation,
    };
  }

  deserialize(event: any): void {
    super.deserialize(event);
    const opts = this.options as CustomNodeOptions;
    opts.type = event.data.type;
    opts.details = event.data.details;
    opts.annotation = event.data.annotation;
  }

  public setAnnotation(txt: string) {
    const opts = this.options as CustomNodeOptions;
    opts.annotation = txt;
  }

  public getAnnotation(): string {
    return (this.options as CustomNodeOptions).annotation || "";
  }
}