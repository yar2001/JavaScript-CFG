import React, { Component } from 'react';
import mermaid from 'mermaid';

export default class Mermaid extends Component<{ chart: string }, { chart: string }> {
  mermaidRef: React.RefObject<HTMLDivElement>;
  constructor(props: { chart: string }) {
    super(props);
    this.state = {
      chart: this.props.chart || '',
    };
    mermaid.initialize({
      startOnLoad: false,
    });
    this.mermaidRef = React.createRef();
  }
  mermaidUpdate() {
    var cb = (svgGraph: any) => {
      this.mermaidRef.current!.innerHTML = svgGraph;
    };

    mermaid.mermaidAPI.render('id0', this.state.chart, cb.bind(this));
  }
  componentDidMount() {
    this.mermaidUpdate();
  }
  componentDidUpdate(prevProps: { chart: string }, prevState: { chart: string }) {
    if (this.props.chart !== prevProps.chart) {
      this.setState({ chart: this.props.chart }, () => {
        this.mermaidUpdate();
      });
    }
  }
  render() {
    var outObj = (
      <div ref={this.mermaidRef} className="mermaid">
        {this.state.chart}
      </div>
    );
    return outObj;
  }
}
