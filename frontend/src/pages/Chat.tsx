import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import { VscUnmute } from 'react-icons/vsc';
import { MdCallEnd } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { IoIosClose } from 'react-icons/io';
import { FaUsers, FaComments, FaVideo, FaVideoSlash, FaShareSquare, FaExpand, FaCompress, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
const iceServersConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Additional STUN/TURN servers can be added here
  ],
};


const Chat: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; isNew?: boolean }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0); 
  const [transcript, setTranscript] = useState('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  

  // Handle incoming messages
  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, isNew: true }]);
      setUnreadCount((prevCount) => prevCount + 1); // Increment unread count
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (currentMessage.trim() !== '') {
      const messageData = { sender: 'User', text: currentMessage };
      socket.emit('message', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setCurrentMessage(''); // Clear input field
    }
  };

  // Initialize peer connection
  useEffect(() => {
    peerConnection.current = new RTCPeerConnection(iceServersConfig);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on('offer', async (data) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', async (data) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data));
    });

    socket.on('candidate', async (data) => {
      await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data));
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('candidate');
    };
  }, []);

  const startTranscription = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Set the language
  
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptText + '\n');
        } else {
          interimTranscript += transcriptText;
        }
      }
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error detected: ' + event.error);
    };
  
    recognition.onend = () => {
      console.log('Speech recognition ended.');
    };
  
    recognition.start();
  };
  

  const startCall = async () => {
    setIsCallActive(true);

    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.current.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, localStream.current!);
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    const offer = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offer);
    socket.emit('offer', offer);

    startTranscription();
  };

  const endCall = () => {
    peerConnection.current?.close();
    setIsCallActive(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    localStream.current?.getTracks().forEach(track => track.stop());
    window.SpeechRecognition?.stop();
  };

  const toggleMic = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getTracks()[0];
      const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
      
      sender?.replaceTrack(screenTrack);
      screenTrack.onended = () => toggleScreenShare(); // Stop sharing when the screen sharing ends

      setIsScreenSharing(true);
    } else {
      const videoTrack = localStream.current?.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');

      sender?.replaceTrack(videoTrack!);
      setIsScreenSharing(false);
    }
  };

  // Mark message as read and update unread count
  const handleMarkAsRead = () => {
    setUnreadCount(0); // Reset unread count
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({
        ...msg,
        isNew: false,
      }))
    );
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-500">
      <div className="w-full h-full">
        <div className="p-1">
          <div className="flex flex-wrap items-center bg-gray-800 rounded-md p-3 border border-gray-200 space-x-2">
            <button className="flex items-center p-2 border rounded-md text-gray-800 h-10 bg-blue-50 hover:bg-blue-100 hover:text-blue-300 duration-300 transition-all">
              <FaUsers className="mr-2 text-xl" />
              <span className="text-sm font-medium">Participants</span>
            </button>
            <button
              onClick={() => setIsMessagingOpen(true)}  // Open the messaging dialog
              className="flex items-center p-2 border rounded-md text-gray-800 h-10 w-24 bg-blue-50 hover:bg-blue-100 hover:text-blue-300 duration-300 transition-all"
            >
              <FaComments className="mr-2 text-xl" />
              <span className="text-sm font-medium">Inbox</span>
            </button>
            <div className="flex space-x-4">
        {!isCallActive ? (
          <button
            onClick={startCall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            End Call
          </button>
        )}
      </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-1/4 bg-gray-00 p-1 border-r overflow-y-auto max-h-[calc(100vh-2rem)]">
            {/* Chat Section */}
            <div className="h-64 bg-slate-400 rounded-md">
              <h1 className="p-1 text-gray-700 font-bold underline">Transcript:</h1>
              <div className="p-2 overflow-y-auto h-[34vh]">
  <p className="whitespace-pre-wrap">{transcript}</p>
</div>
              
              <div className="p-2 overflow-y-auto max-h-[calc(100vh-25rem)]">
                 {/*Add script here */}
                 <h1>

                 </h1>
              </div>
            </div>

            {/* Host's Screen */}
            <div className="bg-gray-800 rounded-md text-center shadow-lg mt-1 p-3">
              <div className="flex justify-center items-center py-1 text-gray-400">
                <span className="font-semibold">Your Screen</span>
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="h-full w-full rounded-md transform -scale-x-100"
              />
              <div className="flex justify-center items-center mt-4 space-x-4">
                <VscUnmute
                  className={`p-2 text-3xl cursor-pointer ${isMicOn ? 'text-white hover:text-green-500' : 'text-gray-400'}`}
                  onClick={toggleMic}
                  aria-label="Toggle Mic"
                />
                <MdCallEnd
                  className="p-2 text-3xl text-red-500 cursor-pointer hover:text-red-700 transition duration-300 ease-in-out"
                  onClick={endCall}
                  aria-label="End Call"
                />
                {isCameraOn ? (
                  <FaVideo
                    className="p-2 text-3xl text-white cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out"
                    onClick={toggleCamera}
                    aria-label="Turn off Camera"
                  />
                ) : (
                  <FaVideoSlash
                    className="p-2 text-3xl text-white cursor-pointer hover:text-yellow-400 transition duration-300 ease-in-out"
                    onClick={toggleCamera}
                    aria-label="Turn on Camera"
                  />
                )}
                <FaShareSquare
                  className={`p-2 text-3xl cursor-pointer transition duration-300 ease-in-out ${isScreenSharing ? 'text-blue-500 hover:text-blue-400' : 'text-white hover:text-blue-400'}`}
                  onClick={toggleScreenShare}
                  aria-label="Toggle Screen Share"
                />
              </div>
            </div>
          </div>

          {/* Participant Screens */}
          <div className="flex justify-center items-center w-full bg-gray-700 rounded-md m-1">
  <video
    ref={remoteVideoRef}
    autoPlay
    className=" rounded-lg h-auto w-auto"
  />
  
</div>
        </div>
      </div>
      {/* Messaging modal dialog */}
      {isMessagingOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white w-3/4 h-3/4 rounded-md shadow-lg p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Messaging Environment</h2>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setIsMessagingOpen(false)}
              >
                <IoIosClose className='text-red-500 text-3xl hover:bg-red-500 hover:text-white duration-200'/>
              </button>
            </div>
            <div className="overflow-y-auto h-full">
  <div className="p-4">
  <div className="h-80 overflow-y-auto bg-gray-100 p-2">
    {messages.map((msg, index) => (
      <div key={index} className="mb-2 break-words">
        <strong>{msg.sender}:</strong> {msg.text}
      </div>
    ))}
  </div>
  <div className="flex mt-4">
    <input
      type="text"
      placeholder="Type a message..."
      value={currentMessage}
      onChange={(e) => setCurrentMessage(e.target.value)}
      className="flex-grow p-2 border rounded-l-md focus:outline-none"
    />
    <button
      className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600"
      onClick={sendMessage}
    >
      Send
    </button>
  </div>
</div>

</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
