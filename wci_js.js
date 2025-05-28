// App.js — React Native (Expo) версія
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [userEmail, setUserEmail] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [workLocation, setWorkLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Доступ до геолокації відхилено');
        return;
      }
      setLocationGranted(true);
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation(loc.coords);
    })();
  }, []);

  const handleMapPress = (e) => {
    setWorkLocation(e.nativeEvent.coordinate);
  };

  const checkIn = async () => {
    if (!workLocation) return Alert.alert('Не вказано місце роботи.');

    const loc = await Location.getCurrentPositionAsync({});
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const withinTime = (hour === 8 && minute >= 30) || (hour === 9 && minute === 0);

    const distance = getDistanceFromLatLonInKm(
      loc.coords.latitude,
      loc.coords.longitude,
      workLocation.latitude,
      workLocation.longitude
    );

    if (distance <= 1 && withinTime) {
      setIsCheckedIn(true);
      Alert.alert('Відмітка успішна!');

      // TODO: Відправити дані на сервер або зберегти локально
try {
  await fetch('https://your-backend-url.onrender.com/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userEmail,
      managerEmail,
      timestamp: new Date().toISOString()
    })
  });
} catch (error) {
  Alert.alert('Помилка під час надсилання даних на сервер.');
  console.error(error);
}
// вставка

    } else {
      Alert.alert('Ви поза межами дозволеного радіусу або не в зазначений час.');
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Налаштування</Text>
      <TextInput
        style={styles.input}
        placeholder="Ваш email"
        value={userEmail}
        onChangeText={setUserEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Email керівника"
        value={managerEmail}
        onChangeText={setManagerEmail}
      />
      <Text>Клікніть на мапу, щоб встановити місце роботи:</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 50.4501,
          longitude: currentLocation?.longitude || 30.5234,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {workLocation && <Marker coordinate={workLocation} />}
      </MapView>
      <Button title={isCheckedIn ? 'Ви вже відмітились' : 'Відмітитись'} onPress={checkIn} disabled={isCheckedIn || !locationGranted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
});
