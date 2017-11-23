import React, { Component } from 'react'
import { Socket, Presence } from 'phoenix'
import queue from '../queue.js'
import Game from './game'
import Menu from './menu'

class Rockpaperawesome extends Component {
  constructor (props) {
    super(props)
    let userName = document.getElementById('User').innerText
    queue(userName, this.setGame)
    const { game } = this.props
    this.state = {
      game: null,
      hand: null,
      data: null,
      playerId: null,
      presences: {}
    }
  }

  componentWillReceiveProps (props) {
    const { game } = props
    this.setState( Object.assign(
      this.state,
      { game: game, data: data }
    ))
  }

  setGame = (game, playerId) => {
    this.setState({game: game, playerId: playerId})
    game.join()
    game.on('throw_complete', (d) => {this.setState(Object.assign(this.state, {data: d}))})
    game.on('presence_state', state => {
      let presences = Presence.syncState(this.state.presences, state)
      this.setState(Object.assign(this.state, {presences: presences}))
    })
    game.on('presence_diff', diff => {
      let presences = Presence.syncDiff(this.state.presences, diff)
      this.setState(Object.assign(this.state, {presences: presences}))
    })
  }

  handleThrow = (hand) => {
    return () => {
      let game = this.state.game
      game && game.push('throw', hand)
    }
  }

  render () {
    const { game, data } = this.state
    let players = data && data.players
    let playerId = this.state.playerId
    let player = players && players.indexOf(playerId)

    if (!game) {
      return (
        <Menu />
      )
    } else {
      return (
        <Game game={game} data={data} player={player} handleThrow={this.handleThrow} />
      )
    }
  }
}

export default Rockpaperawesome
