import React from 'react';
import PropTypes from 'prop-types';

import InvestigatorsListComponent from './InvestigatorsListComponent';

export default class NewDeckView extends React.Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this._onPress = this.onPress.bind(this);
  }

  componentDidMount() {
    this.props.navigator.setTitle({
      title: 'New Deck',
    });
  }

  onPress() {
    this.props.navigator.pop();
  }

  render() {
    const {
      navigator,
    } = this.props;
    return (
      <InvestigatorsListComponent navigator={navigator} onPress={this._onPress} />
    );
  }
}