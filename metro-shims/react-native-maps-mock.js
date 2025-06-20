import React from 'react';
import { View, Text } from 'react-native';

// Mock MapView component for web
const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[{ backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ color: '#666', fontSize: 14 }}>Map View (Web)</Text>
      {children}
    </View>
  );
};

// Mock Marker component for web
const Marker = ({ children, ...props }) => {
  return (
    <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -10 }, { translateY: -10 }] }}>
      <View style={{ width: 20, height: 20, backgroundColor: 'red', borderRadius: 10 }} />
      {children}
    </View>
  );
};

// Mock other common react-native-maps components
const Polyline = () => null;
const Polygon = () => null;
const Circle = () => null;
const Callout = ({ children }) => <View>{children}</View>;

export default MapView;
export { Marker, Polyline, Polygon, Circle, Callout };