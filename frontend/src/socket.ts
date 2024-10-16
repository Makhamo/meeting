// socket.ts
import { io } from 'socket.io-client';


const socket = io('http://localhost:5101');

export default socket;
