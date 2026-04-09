import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store rooms and participants
const rooms = new Map();

// Room structure:
// {
//   id: string,
//   name: string,
//   participants: Map<socketId, { id, name, vote, isHost }>,
//   revealed: boolean,
//   createdAt: Date
// }

// Create a new room
app.post('/api/rooms', (req, res) => {
  const { roomName, hostName } = req.body;
  const roomId = uuidv4().slice(0, 8);
  
  rooms.set(roomId, {
    id: roomId,
    name: roomName || 'Planning Poker Session',
    participants: new Map(),
    revealed: false,
    createdAt: new Date(),
    hostName: hostName
  });
  
  res.json({ roomId, roomName: roomName || 'Planning Poker Session' });
});

// Check if room exists
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({ 
      exists: true, 
      roomName: room.name,
      participantCount: room.participants.size
    });
  } else {
    res.json({ exists: false });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('join-room', ({ roomId, userName, isHost }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Add participant to room
    room.participants.set(socket.id, {
      id: socket.id,
      name: userName,
      vote: null,
      isHost: isHost || room.participants.size === 0
    });
    
    socket.join(roomId);
    socket.roomId = roomId;
    
    // Send current room state to the joining user
    socket.emit('room-state', {
      roomId: room.id,
      roomName: room.name,
      participants: Array.from(room.participants.values()),
      revealed: room.revealed
    });
    
    // Notify others about the new participant
    socket.to(roomId).emit('participant-joined', {
      participant: room.participants.get(socket.id),
      participants: Array.from(room.participants.values())
    });
    
    console.log(`${userName} joined room ${roomId}`);
  });
  
  // Submit a vote
  socket.on('submit-vote', ({ roomId, vote }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    const participant = room.participants.get(socket.id);
    if (participant) {
      participant.vote = vote;
      
      // Broadcast updated participants to all in room
      io.to(roomId).emit('vote-updated', {
        participantId: socket.id,
        hasVoted: true,
        participants: Array.from(room.participants.values()).map(p => ({
          ...p,
          vote: room.revealed ? p.vote : (p.vote !== null ? '?' : null)
        }))
      });
    }
  });
  
  // Reveal votes
  socket.on('reveal-votes', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    room.revealed = true;
    
    io.to(roomId).emit('votes-revealed', {
      participants: Array.from(room.participants.values()),
      revealed: true
    });
  });
  
  // Reset votes for new round
  socket.on('reset-votes', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    room.revealed = false;
    room.participants.forEach(participant => {
      participant.vote = null;
    });
    
    io.to(roomId).emit('votes-reset', {
      participants: Array.from(room.participants.values()),
      revealed: false
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    
    if (roomId) {
      const room = rooms.get(roomId);
      
      if (room) {
        const participant = room.participants.get(socket.id);
        room.participants.delete(socket.id);
        
        // If room is empty, delete it
        if (room.participants.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          // Notify others about the leaving participant
          io.to(roomId).emit('participant-left', {
            participantId: socket.id,
            participantName: participant?.name,
            participants: Array.from(room.participants.values())
          });
        }
        
        console.log(`User ${participant?.name} left room ${roomId}`);
      }
    }
    
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Planning Poker server running on port ${PORT}`);
});
