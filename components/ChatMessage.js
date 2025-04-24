import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../constants/colors';

const ChatMessage = ({ message, isUser }) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/brain-mascot.png')}
            style={styles.avatar}
          />
        </View>
      )}
      
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.botText
        ]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 5,
  },
  userBubble: {
    backgroundColor: '#efefef',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.chatBubble,
    borderTopLeftRadius: 4,
  },
  text: {
    fontSize: 16,
  },
  userText: {
    color: Colors.darkGray,
  },
  botText: {
    color: Colors.darkGray,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default ChatMessage;