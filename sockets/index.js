function registerSockets(io) {
  io.on('connection', (socket) => {
    // Client joins a room per poll for live updates
    socket.on('joinPollRoom', ({ pollId }) => {
      if (!pollId) return;
      socket.join(`poll:${pollId}`);
    });

    socket.on('leavePollRoom', ({ pollId }) => {
      if (!pollId) return;
      socket.leave(`poll:${pollId}`);
    });
  });
}

module.exports = { registerSockets };