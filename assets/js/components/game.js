import React, { Component } from 'react'
import Scores from './scores'
import Throws from './throws'
import ThrowControls from './throwControls'

class Game extends Component {
  constructor (props) {
    super(props)
    this.state = {
      game: props.game,
      data: props.data,
      player: props.player,
    }
  }

  componentWillReceiveProps(props) {
    this.setState(
      Object.assign(
        this.state,
        {
          game: props.game,
          data: props.data,
          player: props.player
        }
      )
    )
  }

  render () {
    const { game, data, player } = this.state
    return (
      <div>
        <Scores data={data} player={player} />
        <Throws data={data} player={player} />
        <ThrowControls game={game} />
      </div>
    )
  }
}

export default Game