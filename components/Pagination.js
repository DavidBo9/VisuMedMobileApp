import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';

const Pagination = ({ data, activeIndex, onDotPress }) => {
  return (
    <View style={styles.container}>
      {data.map((_, i) => (
        <TouchableOpacity
          key={i.toString()}
          style={[
            styles.dot,
            i === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
          onPress={() => onDotPress(i)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    backgroundColor: Colors.lightGray,
  },
});

export default Pagination;