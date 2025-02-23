// src/types/node.ts
import { v4 as uuidv4 } from "uuid";
import { DefaultNodeModel, DefaultNodeModelOptions } from "@projectstorm/react-diagrams";

/** Add custom fields (type, details, annotation, etc.) */
export interface CustomNodeOptions extends DefaultNodeModelOptions {
  type?: string;       // "RelationalDB" or "NoSQL_Document", etc.
  details?: string;    // A short description
  annotation?: string; // Possibly user-edited
  x?: number;
  y?: number;
  id?: string;         // We'll generate if not provided
}

export class CustomNodeModel extends DefaultNodeModel {
  constructor(options: CustomNodeOptions) {
    // If no ID given, generate
    if (!options.id) {
      options.id = uuidv4();
    }
    // Pass the "type" to the underlying model so the engine can pick the correct factory
    super(options);
    // If x,y provided, set position right away
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
