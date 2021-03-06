defmodule Rockpaperawesome.QueueChannel do
  use RockpaperawesomeWeb, :channel
  alias Rockpaperawesome.{Presence, MatchMaker, GameServer}

  def join("queue", _, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:seconds)),
    })

    MatchMaker.queue_player(socket.assigns.user_id)

    {:noreply, socket}
  end

  def handle_in("check_for_game", _, %{assigns: %{user_id: user_id}} = socket) do
    with {:ok, game_id} <- GameServer.find_game_id(user_id) do
      assign(socket, :game_id, game_id)

      push(socket, "game_found", %{game_id: game_id, user_id: user_id})
    end

    {:noreply, socket}
  end
end
