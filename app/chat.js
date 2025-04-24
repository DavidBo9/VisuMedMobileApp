import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Define colors with a more modern palette
const Colors = {
  primary: '#00a77e',       // Green color
  secondary: '#60c6a8',     // Lighter green for accents
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#333333',
  lightGray: '#94a3b8',
  inputBackground: '#f1f5f9',
  chatBubble: '#e6f7d9',
  bubbleShadow: 'rgba(0,0,0,0.05)',
};

// Sample chat responses
const chatResponses = {
  'en que consiste este estudio': 'El Axial T2 FLAIR es una imagen del cerebro tomada en cortes horizontales, como si viéramos la cabeza desde arriba. Usa una técnica especial que apaga el brillo del líquido que normalmente rodea el cerebro, para que se noten mejor posibles lesiones o zonas afectadas, sobre todo en áreas profundas como la sustancia blanca. Este tipo de estudio se usa mucho cuando se quiere revisar si hay señales de inflamación, daños por enfermedades neurológicas o cambios que no se ven tan bien en otras imágenes.',
  'para qué sirve esta resonancia': 'Esta resonancia magnética cerebral permite visualizar en detalle las estructuras del cerebro para identificar anomalías como tumores, inflamaciones, sangrados, infartos, o cambios relacionados con enfermedades neurológicas como esclerosis múltiple o demencia.',
  'qué significa la parte oscura': 'Las áreas oscuras en una resonancia magnética cerebral generalmente representan estructuras que contienen líquido, como los ventrículos cerebrales que contienen líquido cefalorraquídeo, o pueden indicar áreas con menos densidad de tejido.',
  'es normal esta imagen': 'No puedo proporcionar diagnósticos médicos. Solo un médico especialista que conozca tu historial clínico completo puede interpretar correctamente estas imágenes y determinar si hay hallazgos normales o anormales.',
};

// Animated message component with improved styling
const Message = ({ text, isUser, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
      delay: index * 100,
    }).start();
  }, []);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  
  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
        { 
          opacity, 
          transform: [
            { translateY },
            { scale }
          ] 
        }
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="medical" size={16} color={Colors.white} />
          </View>
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : {}
        ]}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
};

// Typing indicator with animation
// Fixed TypingIndicator component
const TypingIndicator = () => {
// A completely rewritten, safer typing indicator component
    // Set up a single animation that we'll use for all dots
    const animation = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      // Create a simple looping animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      return () => {
        animation.stopAnimation();
      };
    }, []);
    
    // Create interpolated values for each dot with different timing
    const dot1TranslateY = animation.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0, -5, -5, 0],
    });
    
    const dot2TranslateY = animation.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0, 0, -5, 0],
    });
    
    const dot3TranslateY = animation.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0, 0, 0, -5],
    });
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="medical" size={16} color={Colors.white} />
          </View>
        </View>
        <View style={styles.typingBubble}>
          {/* Add a hidden text component as a safety measure */}
          <Text style={{height: 0, color: 'transparent'}}>.</Text>
          
          <Animated.View 
            style={[
              styles.typingDot,
              { transform: [{ translateY: dot1TranslateY }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.typingDot,
              { transform: [{ translateY: dot2TranslateY }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.typingDot,
              { transform: [{ translateY: dot3TranslateY }] }
            ]}
          />
        </View>
      </View>
    );
  };

export default function ChatScreen({ currentMriType = 'eADC', onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const inputAnimation = useRef(new Animated.Value(0)).current;

  // Animate header and input area on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnimation, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    
    // Show typing indicator
    setIsTyping(true);
    
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
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1500);

    // Clear input
    setMessage('');
    Keyboard.dismiss();
  };

  // Header opacity and translation animation
  const headerTranslateY = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });
  
  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  // Input area translation animation
  const inputTranslateY = inputAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const inputOpacity = inputAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>MRI Cerebral</Text>
          <Text style={styles.headerSubtitle}>{currentMriType}</Text>
        </View>
        
        <View style={{ width: 40 }} /> {/* Empty view for balanced header */}
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((item, index) => (
            <Message
              key={index}
              text={item.text}
              isUser={item.isUser}
              index={index}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Animated Input area */}
        <Animated.View 
          style={[
            styles.inputContainer,
            {
              opacity: inputOpacity,
              transform: [{ translateY: inputTranslateY }],
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="¿En qué consiste este estudio?"
              placeholderTextColor={Colors.lightGray}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.inputIcon}>
              <Ionicons name="mic" size={22} color={Colors.lightGray} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              message.trim() === '' ? styles.sendButtonDisabled : {},
            ]} 
            onPress={handleSend}
            disabled={message.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={22} 
              color={message.trim() === '' ? Colors.lightGray : Colors.white} 
            />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 15,
    backgroundColor: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(50,50,50,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  mainContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginBottom: 14,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: Colors.bubbleShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.inputBackground,
    borderTopRightRadius: 5,
  },
  botBubble: {
    backgroundColor: Colors.chatBubble,
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.darkGray,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: Colors.chatBubble,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 5,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 36,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 3,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: Colors.darkGray,
    maxHeight: 100,
  },
  inputIcon: {
    paddingHorizontal: 5,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
  },
});