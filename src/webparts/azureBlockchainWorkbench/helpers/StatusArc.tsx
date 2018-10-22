//transferred from statusarc.js from Azure blockchain workbench
import * as React from 'react';
import * as d3 from 'd3';

import styles from '../components/AzureBlockchainWorkbench.module.scss';
//import * as strings from 'AzureBlockchainWorkbenchWebPartStrings';

export interface IStatusArcProps {
  height: number;
  width: number;
  radius: number;
  id: string;
  percentComplete?: number;
  duration?: number;
  styleDonut: string; //Sucess or Failure
}

export interface IStatusArcState {
}

export class StatusArc extends React.Component<IStatusArcProps, IStatusArcState> {
  private static defaultProps = {
    percentComplete: 0,
    duration: 2000
  } as IStatusArcProps;

  private tau: number = Math.PI * 2;

  constructor(props:IStatusArcProps) {
    super(props);
  }

  public componentDidMount(): void {
    this.drawArc();
  }

  public componentDidUpdate(): void {
    this.redrawArc();
  }

  public shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    if (
      this.props.height != nextProps.height ||
      this.props.width != nextProps.width ||
      this.props.radius != nextProps.radius ||
      this.props.percentComplete != nextProps.percentComplete ||
      this.props.duration != nextProps.duration
    ) {
      return true;
    }
    return false;
  }

  public render(): React.ReactElement<IStatusArcProps> {
    return (
      <div ref="arc" />
    );
  }

  private redrawArc(): void {
    const context = d3.select(`#${this.props.id}`);
    context.remove();
    this.drawArc();
  }

  private drawArc(): void {
    const context: d3 = this.setContext();
    this.setBackground(context);
    this.setForeground(context);
    this.updatePercent(context);
  }

  private setContext(): d3 {
    const { height, width, id } = this.props;

    return d3
    // eslint-disable-next-line react/no-string-refs
      .select(this.refs.arc)
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      .attr('id', id)
      .append('g')
      .attr('transform', `translate(${height / 2}, ${width / 2})`);
  }

  private setBackground(context: d3): d3 {
    const { styleDonut, percentComplete } = this.props;
    let style = 'statusArcBackground';
    if (styleDonut === 'Success' && percentComplete === 1) {
      style = 'statusArcBackground-Success';
    }
    if (styleDonut === 'Failure') {
      style = 'statusArcBackground-Failure';
    }
    return context
      .append('path')
      .datum({ endAngle: this.tau })
      .attr('class', style)
      .attr('d', this.arc());
  }

  private setForeground(context: d3): d3 {
    const { styleDonut, percentComplete } = this.props;
    let style = 'statusArcForegroundBackground';
    if (styleDonut === 'Success' && percentComplete === 1) {
      style = 'statusArcForegroundBackground-Success';
    }
    if (styleDonut === 'Failure') {
      style = 'statusArcForegroundBackground-Failure';
    }
    return context
      .append('path')
      .datum({ endAngle: 0 })
      .attr('class', style)
      .attr('d', this.arc());
  }

  private arc(): d3 {
    return d3
      .arc()
      .innerRadius(this.props.radius)
      .outerRadius(this.props.radius + 20)
      .startAngle(0);
  }

  private updatePercent(context: d3): d3 {
    return this.setForeground(context)
      .transition()
      .duration(this.props.duration)
      .call(this.arcTween, this.tau * this.props.percentComplete, this.arc());
  }

  // eslint-disable-next-line class-methods-use-this
  private arcTween(transition: any, newAngle: number, arc: d3): d3 {
    transition.attrTween('d', (d) => {
      const interpolate = d3.interpolate(d.endAngle, newAngle);
      const newArc = d;
      return (t) => {
        newArc.endAngle = interpolate(t);
        return arc(newArc);
      };
    });
  }
}
