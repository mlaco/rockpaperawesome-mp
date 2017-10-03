defmodule Rockpaperawesome.MatchMaker do
  use GenServer

  alias Rockpaperawesome.GameServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    {:ok, %{queue: [], playing: []}}
  end

  def check do
    GenServer.call(__MODULE__, {:check, ''})
  end

  def queue_player(player_id) do
    GenServer.call(__MODULE__, {:queue_player, player_id})

    # Maybe:
    # This shouldn't be run once after queueing players,
    # it should be run periodically
    # For now it makes sense since a game is simply created
    # after every other player joins.
    # There are no game modes or game preferences that would
    # make it otherwise.
    GenServer.call(__MODULE__, {:check_for_new_games})
  end

  #===============================================================================
  # Call handlers
  #===============================================================================

  def handle_call({:queue_player, player_id}, _from, state) do
    if should_queue?(player_id, state) do
      queue = state.queue ++ [player_id]
      new_state = Map.put(state, :queue, queue)
      {:reply, :ok, new_state}
    else
      {:reply, :ok, state}
    end
  end

  def handle_call({:check_for_new_games}, _from, state) do
    if length(state.queue) > 1 do
      {two, rest} = Enum.split(state.queue, 2)

      {:ok, game_id} = GameServer.start_game(two)

      # Notify GameChannel of the new game
      # bkm

      # record users ids to playing list
      playing = state.playing ++ two
      new_state =
        state
        |> Map.put(:queue, rest)
        |> Map.put(:playing, playing)

      {:reply, :ok, new_state}
    else
      {:reply, :ok, state}
    end
  end


  # ==============================================================================
  # Helpers
  # ==============================================================================

  def should_queue?(player_id, state) do
    playing = List.flatten(state.playing)
    !Enum.member?(state.queue, player_id) &&
      !Enum.member?(playing, player_id)
  end
end