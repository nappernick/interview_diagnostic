import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';

export class CustomNodeModel extends NodeModel {
  constructor(options: { subtype: string; label: string; color: string }) {
    super({ type: 'custom-node', ...options });
    this.subtype = options.subtype;
    this.label = options.label;
    this.color = options.color;

    // Add input and output ports
    this.addPort(new DefaultPortModel({ in: true, name: 'in' }));
    this.addPort(new DefaultPortModel({ in: false, name: 'out' }));
  }

  // Properties
  subtype: string;
  label: string;
  color: string;
}