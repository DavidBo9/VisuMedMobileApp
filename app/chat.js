import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  LogBox
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ignorar advertencias específicas que podrían interferir
LogBox.ignoreLogs(['Warning: ...']); // Ajusta esto con las advertencias específicas si las conoces

const Colors = {
  primary: '#00a77e',
  secondary: '#e74c3c',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#333333',
  lightGray: '#cccccc',
};

// Respuestas predefinidas simplificadas
const RESPUESTAS = [
  "He analizado la resonancia magnética. Las estructuras cerebrales visibles parecen estar dentro de los límites normales.",
  "Puedo ver algunas áreas de interés en esta imagen."
];

export default function ChatScreen({ currentMriType = 'Desconocido', onClose }) {
  console.log('ChatScreen - Inicializando componente');
  
  // Estados básicos
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const scrollViewRef = useRef();

  // Inicializar componente de forma segura
  useEffect(() => {
    console.log('ChatScreen - useEffect inicial');
    
    try {
      // Marcamos como listo primero
      setIsReady(true);
      
      // Luego agregamos el mensaje inicial con un pequeño retraso
      const timer = setTimeout(() => {
        try {
          setMessages([{ 
            id: 1, 
            text: `Bienvenido al Asistente IA de VisuMed. ¿Cómo puedo ayudarte con esta resonancia magnética ${currentMriType || 'Cerebral'}?`, 
            isUser: false 
          }]);
          console.log('ChatScreen - Mensaje inicial agregado');
        } catch (error) {
          console.error('Error al agregar mensaje inicial:', error);
        }
      }, 500);
      
      return () => {
        clearTimeout(timer);
        console.log('ChatScreen - Limpieza del timer');
      };
    } catch (error) {
      console.error('Error en useEffect inicial:', error);
    }
  }, []);

  // Función simplificada para enviar mensajes
  const handleSend = () => {
    try {
      if (message.trim() === '') return;
      
      // Agregar mensaje del usuario
      const userMessage = {
        id: Date.now(),
        text: message,
        isUser: true
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setMessage('');
      
      // Simular respuesta
      setIsTyping(true);
      
      setTimeout(() => {
        try {
          setIsTyping(false);
          const randomResponse = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)];
          
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: Date.now() + 1,
              text: randomResponse,
              isUser: false
            }
          ]);
        } catch (error) {
          console.error('Error al agregar respuesta:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error en handleSend:', error);
    }
  };

  // Función segura para cerrar el chat
  const handleClose = () => {
    console.log('ChatScreen - Cerrando chat');
    try {
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error al cerrar chat:', error);
    }
  };

  // Un renderizado minimalista para probar funcionalidad básica
  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Asistente IA</Text>
          <Text style={styles.subtitle}>{currentMriType || 'Cerebral'}</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.isUser ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.messageText}>Escribiendo...</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={Colors.lightGray}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={message.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={Colors.white} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 30,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: Colors.darkGray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: Colors.white,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.darkGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.darkGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: Colors.white,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});