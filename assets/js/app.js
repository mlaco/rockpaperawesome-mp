// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import 'phoenix_html'

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

// ============================================================================
// Setup
// ============================================================================

import {Socket, Presence} from 'phoenix'

let userName = document.getElementById('User').innerText
let joinCheckId = null
let socket = new Socket('/socket', {params: {user_name: userName}})
socket.connect()

let queue = socket.channel('queue')
let presences = {}

let game = null
const outputElem = document.getElementById('output')
const gameIdElem = document.getElementById('gameId')

// ============================================================================
// Data handling
// ============================================================================

let formatTimestamp = (timestamp) => {
  let date = new Date(timestamp)
  return date.toLocaleTimeString()
}

let playerNames = (presences) => {
  let values = presences && Object.values(presences)
  let content = values && values.map(v => {
    let userName = v.metas[0]["user_name"]
    return userName
  })
  return content.join(' vs ')
}

// ============================================================================
// Receivers
// ============================================================================

const onThrowComplete = data => {
  let turn = data.turns[0]
  let content = `${turn.p1} ${turn.p2}`
  console.log('p1', turn.p1)
  console.log('p2', turn.p2)
  outputElem.innerText = content
}

queue.on('game_found', data => {
  let gameId = data['game_id']
  console.log('Joined game', gameId)
  clearInterval(joinCheckId)

  game = socket.channel('game:' + gameId)
  game.join()

  game.on('throw_complete', onThrowComplete)

  game.on('presence_state', state => {
    presences = Presence.syncState(presences, state)
    gameIdElem.innerText = playerNames(presences)
  })

  game.on('presence_diff', diff => {
    presences = Presence.syncDiff(presences, diff)
    gameIdElem.innerText = playerNames(presences)
  })
})

queue.join()

// Poll for joined game
let joinCheck = function () {
  queue.push('check_for_game')
}

joinCheckId = setInterval(joinCheck, 1000)

// ============================================================================
// Message senders
// ============================================================================

let throwHandler = function (hand) {
  game && game.push('throw', hand)
}

let throwHandlerClosure = function (hand) {
  return function () {
    return throwHandler(hand)
  }
}

document.getElementById('input-rock').onclick = throwHandlerClosure('0')
document.getElementById('input-paper').onclick = throwHandlerClosure('1')
document.getElementById('input-scissors').onclick = throwHandlerClosure('2')
