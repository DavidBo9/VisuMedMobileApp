// AnnotationSystem.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ANNOTATION_TYPES = {
  FREE_DRAW: 'free_draw',
  ARROW: 'arrow',
  CIRCLE: 'circle',
  TEXT: 'text'
};

const Colors = {
  primary: '#00a77e',
  white: '#FFFFFF',
  sliderThumb: '#00a77e',
};

export const AnnotationTool = ({ 
  strokeColor, 
  setStrokeColor, 
  strokeWidth, 
  setStrokeWidth,
  clearDrawing,
  annotationType,
  setAnnotationType 
}) => {
  return (
    <View style={styles.toolContainer}>
      <Text style={styles.toolTitle}>Annotation Tool</Text>
      
      <View style={styles.annotationTypeContainer}>
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            annotationType === ANNOTATION_TYPES.FREE_DRAW && styles.activeTypeButton
          ]}
          onPress={() => setAnnotationType(ANNOTATION_TYPES.FREE_DRAW)}
        >
          <MaterialCommunityIcons name="pencil" size={22} color={Colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            annotationType === ANNOTATION_TYPES.ARROW && styles.activeTypeButton
          ]}
          onPress={() => setAnnotationType(ANNOTATION_TYPES.ARROW)}
        >
          <MaterialCommunityIcons name="arrow-right" size={22} color={Colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            annotationType === ANNOTATION_TYPES.CIRCLE && styles.activeTypeButton
          ]}
          onPress={() => setAnnotationType(ANNOTATION_TYPES.CIRCLE)}
        >
          <MaterialCommunityIcons name="circle-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            annotationType === ANNOTATION_TYPES.TEXT && styles.activeTypeButton
          ]}
          onPress={() => setAnnotationType(ANNOTATION_TYPES.TEXT)}
        >
          <MaterialCommunityIcons name="format-text" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.colorOptions}>
        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffffff'].map(color => (
          <TouchableOpacity 
            key={color}
            style={[
              styles.colorOption, 
              { backgroundColor: color },
              strokeColor === color && styles.selectedColor
            ]}
            onPress={() => setStrokeColor(color)}
          />
        ))}
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Width:</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={strokeWidth}
          onValueChange={setStrokeWidth}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.lightGray}
          thumbTintColor={Colors.sliderThumb}
        />
        <Text style={styles.sliderValue}>{strokeWidth}</Text>
      </View>
      
      <TouchableOpacity style={styles.resetButton} onPress={clearDrawing}>
        <Text style={styles.resetButtonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );
};

export const renderAnnotations = (paths, currentPath, annotationType, strokeColor, strokeWidth, width, height) => {
  return (
    <Svg 
      height="100%" 
      width="100%" 
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {paths.map((path, index) => {
        if (path.type === ANNOTATION_TYPES.FREE_DRAW) {
          return (
            <Path
              key={`path-${index}`}
              d={createPath(path.points)}
              stroke={path.color}
              strokeWidth={path.width}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        } else if (path.type === ANNOTATION_TYPES.ARROW) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          return (
            <React.Fragment key={`arrow-${index}`}>
              <Line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={path.color}
                strokeWidth={path.width}
              />
              {renderArrowHead(start, end, path.color, path.width)}
            </React.Fragment>
          );
        } else if (path.type === ANNOTATION_TYPES.CIRCLE) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const radius = calculateDistance(start, end);
          return (
            <Circle
              key={`circle-${index}`}
              cx={start.x}
              cy={start.y}
              r={radius}
              stroke={path.color}
              strokeWidth={path.width}
              fill="none"
            />
          );
        } else if (path.type === ANNOTATION_TYPES.TEXT && path.text) {
          return (
            <SvgText
              key={`text-${index}`}
              x={path.points[0].x}
              y={path.points[0].y}
              fill={path.color}
              fontSize={path.width * 5}
              textAnchor="middle"
            >
              {path.text}
            </SvgText>
          );
        }
        return null;
      })}
      
      {currentPath.length > 1 && renderCurrentAnnotation(currentPath, annotationType, strokeColor, strokeWidth)}
    </Svg>
  );
};

const renderCurrentAnnotation = (currentPath, annotationType, strokeColor, strokeWidth) => {
  if (annotationType === ANNOTATION_TYPES.FREE_DRAW) {
    return (
      <Path
        d={createPath(currentPath)}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  } else if (annotationType === ANNOTATION_TYPES.ARROW) {
    const start = currentPath[0];
    const end = currentPath[currentPath.length - 1];
    return (
      <React.Fragment>
        <Line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {renderArrowHead(start, end, strokeColor, strokeWidth)}
      </React.Fragment>
    );
  } else if (annotationType === ANNOTATION_TYPES.CIRCLE) {
    const start = currentPath[0];
    const end = currentPath[currentPath.length - 1];
    const radius = calculateDistance(start, end);
    return (
      <Circle
        cx={start.x}
        cy={start.y}
        r={radius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
    );
  }
  return null;
};

const renderArrowHead = (start, end, color, width) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.max(width * 3, 10); // Arrow head size based on stroke width
  
  const x1 = end.x - length * Math.cos(angle - Math.PI / 6);
  const y1 = end.y - length * Math.sin(angle - Math.PI / 6);
  const x2 = end.x - length * Math.cos(angle + Math.PI / 6);
  const y2 = end.y - length * Math.sin(angle + Math.PI / 6);
  
  return (
    <>
      <Line
        x1={end.x}
        y1={end.y}
        x2={x1}
        y2={y1}
        stroke={color}
        strokeWidth={width}
      />
      <Line
        x1={end.x}
        y1={end.y}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
      />
    </>
  );
};

// Helper functions
const createPath = (points) => {
  if (!points || points.length < 2) return '';
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x},${points[i].y}`;
  }
  return path;
};

const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const styles = StyleSheet.create({
  toolContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 15,
    zIndex: 6,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  annotationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  typeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTypeButton: {
    backgroundColor: Colors.primary,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  selectedColor: {
    borderColor: Colors.white,
    borderWidth: 3,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: {
    width: 70,
    fontSize: 14,
    color: Colors.white,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 40,
    fontSize: 14,
    color: Colors.white,
    textAlign: 'right',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ANNOTATION_TYPES;