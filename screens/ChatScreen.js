import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import ChatMessage from '../components/ChatMessage';
import { chatResponses } from '../constants/mriData';

const ChatScreen = ({ currentMriType, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();

  // Add initial greeting when component mounts
  useEffect(() => {
    const initialMessage = {
      text: `¡Hola! Soy tu asistente médico. Puedes preguntarme sobre tu ${currentMriType}. ¿En qué puedo ayudarte?`,
      isUser: false,
    };
    setMessages([initialMessage]);
  }, [currentMriType]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Send message handler
  const handleSend = () => {
    if (message.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      text: message,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Find matching response or use default
    let botResponse;
    const lowercaseMessage = message.toLowerCase().trim();
    
    // Check if the message matches any key in chatResponses
    const matchingKey = Object.keys(chatResponses).find(key => 
      lowercaseMessage.includes(key)
    );
    
    if (matchingKey) {
      botResponse = {
        text: chatResponses[matchingKey],
        isUser: false,
      };
    } else {
      botResponse = {
        text: 'Lo siento, no tengo información específica sobre esa pregunta. ¿Podrías intentar preguntarme sobre qué consiste este estudio o para qué sirve?',
        isUser: false,
      };
    }

    // Add bot response after a short delay to simulate thinking
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);

    // Clear input
    setMessage('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MRI Cerebral</Text>
          <Text style={styles.headerSubtitle}>{currentMriType}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((item, index) => (
            <ChatMessage
              key={index}
              message={item.text}
              isUser={item.isUser}
            />
          ))}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="En que consiste este estudio?"
              placeholderTextColor={Colors.lightGray}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={20} color={Colors.lightGray} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mic" size={20} color={Colors.lightGray} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === '' && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={message.trim() === ''}
          >
            <Ionicons
              name="send"
              size={20}
              color={message.trim() === '' ? Colors.lightGray : Colors.white}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: Colors.darkGray,
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.inputBackground,
  },
});

export default ChatScreen;