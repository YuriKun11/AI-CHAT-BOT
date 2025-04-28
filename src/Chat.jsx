import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";
import profile from "./assets/yuri.jpg"; 

import "./App.css";

const ChatUI = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "bot",
      message:
        "Hi there! 👋🏻 Thanks for visiting my website. Feel free to ask me anything about programming, web development, or my experiences in tech. Let me know how I can help!",
    },
  ]);

  const inputRef = useRef(null); 

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // GEMINI API
  const genAI = new GoogleGenerativeAI("api"); //change mo to sa API MO punta ka sa https://aistudio.google.com/app/apikey
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Auto-scroll 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (userInput.trim() === "") return;
  
    const newUserMessage = { type: "user", message: userInput };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
  
    try {

      let prompt = ` "${userInput}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botMessage = { type: "bot", message: response.text() };
      setChatHistory((prev) => [...prev, botMessage]);
  
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", message: "Sorry, something went wrong! ❌" },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setUserInput("");
      sendMessage();
    }
  };

    useEffect(() => {
      if (!isLoading && inputRef.current) {
        inputRef.current.focus(); 
      }
    }, [isLoading]); 

  return (
    <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
    <div className="w-full max-w-6xl min-w-[300px] h-full bg-white rounded-md shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-300 flex items-center">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-400 flex-shrink-0">
          <img src={profile} alt="Yuri Avatar" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="ml-4 flex-1">
          <h6 className="text-lg font-semibold text-gray-800">Yuri</h6>
          <p className="text-xs text-green-500">Online</p>
          <p className="text-xs text-gray-500">
            This AI is currently in its training phase (beta version). While it's learning and improving, it may not be fully polished yet. Your feedback and patience are appreciated!
          </p>
        </div>
      </div>


      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatHistory.map((chat, index) => (
          chat.type === "bot" ? (
            <motion.div
              key={index}
              className="flex justify-start items-end space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img src={profile} alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover" />
              <div className="max-w-xs md:max-w-md bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm">
                {chat.message}
              </div>
            </motion.div>
          ) : (
            <div key={index} className="flex justify-end">
              <div className="max-w-xs md:max-w-md bg-blue-500 text-white rounded-lg px-4 py-2 text-sm">
                {chat.message}
              </div>
            </div>
          )
        ))}
        {isLoading && (
          <motion.div
            className="flex justify-start items-end space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
          >
            <img src={profile} alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="max-w-xs md:max-w-md bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm">
              Typing...
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-300 flex items-center bg-white">
        <input
          autoComplete="off"
          id="user-input"
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          ref={inputRef}
        />
        <button
          className="ml-3 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={sendMessage}
          disabled={isLoading}
        >
          <FaPaperPlane className="text-xl" />
        </button>
      </div>
    </div>
  </div>
  );
};

export default ChatUI;
