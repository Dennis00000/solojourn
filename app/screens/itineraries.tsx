import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Platform, ScrollView, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';

interface Activity {
  id: string;
  name: string;
}

interface Day {
  id: string;
  date: string;
  activities: Activity[];
}

interface Itinerary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function ItinerariesScreen() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [newDayDate, setNewDayDate] = useState('');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Load itineraries from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('itineraries');
        if (data) setItineraries(JSON.parse(data));
      } catch (e) {
        // Optionally handle error
      }
      setLoading(false);
    })();
  }, []);

  // Save itineraries to AsyncStorage on change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('itineraries', JSON.stringify(itineraries));
    }
  }, [itineraries, loading]);

  // Add new itinerary
  const addItinerary = () => {
    if (!newName || !newStart || !newEnd) return;
    setItineraries([...itineraries, {
      id: generateId(),
      name: newName,
      startDate: newStart,
      endDate: newEnd,
      days: [],
    }]);
    setNewName('');
    setNewStart('');
    setNewEnd('');
    setModalVisible(false);
  };

  // Delete itinerary
  const deleteItinerary = (id: string) => {
    setItineraries(itineraries.filter(i => i.id !== id));
    setSelectedItinerary(null);
  };

  // Add day to itinerary
  const addDay = () => {
    if (!selectedItinerary || !newDayDate) return;
    const updated = itineraries.map(i =>
      i.id === selectedItinerary.id
        ? { ...i, days: [...i.days, { id: generateId(), date: newDayDate, activities: [] }] }
        : i
    );
    setItineraries(updated);
    setSelectedItinerary(updated.find(i => i.id === selectedItinerary.id) || null);
    setNewDayDate('');
    setDayModalVisible(false);
  };

  // Delete day
  const deleteDay = (dayId: string) => {
    if (!selectedItinerary) return;
    const updated = itineraries.map(i =>
      i.id === selectedItinerary.id
        ? { ...i, days: i.days.filter(d => d.id !== dayId) }
        : i
    );
    setItineraries(updated);
    setSelectedItinerary(updated.find(i => i.id === selectedItinerary.id) || null);
  };

  // Add activity to day
  const addActivity = () => {
    if (!selectedItinerary || !selectedDay || !newActivity) return;
    const updated = itineraries.map(i => {
      if (i.id !== selectedItinerary.id) return i;
      return {
        ...i,
        days: i.days.map(d =>
          d.id === selectedDay.id
            ? { ...d, activities: [...d.activities, { id: generateId(), name: newActivity }] }
            : d
        ),
      };
    });
    setItineraries(updated);
    setSelectedItinerary(updated.find(i => i.id === selectedItinerary.id) || null);
    setNewActivity('');
    setActivityModalVisible(false);
  };

  // Delete activity
  const deleteActivity = (dayId: string, activityId: string) => {
    if (!selectedItinerary) return;
    const updated = itineraries.map(i => {
      if (i.id !== selectedItinerary.id) return i;
      return {
        ...i,
        days: i.days.map(d =>
          d.id === dayId
            ? { ...d, activities: d.activities.filter(a => a.id !== activityId) }
            : d
        ),
      };
    });
    setItineraries(updated);
    setSelectedItinerary(updated.find(i => i.id === selectedItinerary.id) || null);
  };

  const shareItinerary = async (itinerary: Itinerary) => {
    let text = `Trip: ${itinerary.name}\nDates: ${itinerary.startDate} - ${itinerary.endDate}\n`;
    itinerary.days.forEach((day, i) => {
      text += `\nDay ${i + 1} (${day.date}):\n`;
      if (day.activities.length === 0) {
        text += '  (No activities)\n';
      } else {
        day.activities.forEach((act, j) => {
          text += `  - ${act.name}\n`;
        });
      }
    });
    try {
      await Share.share({ message: text });
    } catch (error) {
      // Optionally handle error
    }
  };

  const addItineraryToCalendar = async (itinerary: Itinerary) => {
    setCalendarLoading(true);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        setCalendarLoading(false);
        alert('Calendar permission is required.');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      if (!defaultCalendar) {
        setCalendarLoading(false);
        alert('No modifiable calendar found.');
        return;
      }
      for (const day of itinerary.days) {
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `${itinerary.name} - Day`,
          startDate: new Date(day.date),
          endDate: new Date(day.date),
          allDay: true,
          notes: day.activities.map(a => a.name).join(', '),
        });
      }
      alert('Itinerary added to your calendar!');
    } catch (e) {
      alert('Failed to add to calendar.');
    }
    setCalendarLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0EA5E9" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Itineraries</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color="#0EA5E9" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={itineraries}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itineraryCard} onPress={() => setSelectedItinerary(item)}>
            <Text style={styles.itineraryName}>{item.name}</Text>
            <Text style={styles.itineraryDates}>{item.startDate} - {item.endDate}</Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareItinerary(item)}
            >
              <Ionicons name="share-outline" size={20} color="#0EA5E9" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => addItineraryToCalendar(item)}
            >
              <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#64748B" style={{ position: 'absolute', right: 16, top: 24 }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No itineraries yet. Tap + to add one!</Text>}
      />

      {/* Add Itinerary Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Itinerary</Text>
            <TextInput
              style={styles.input}
              placeholder="Trip Name"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Start Date (e.g. 2024-07-01)"
              value={newStart}
              onChangeText={setNewStart}
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (e.g. 2024-07-10)"
              value={newEnd}
              onChangeText={setNewEnd}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addItinerary} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Itinerary Detail Modal */}
      <Modal visible={!!selectedItinerary} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedItinerary(null)} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedItinerary?.name}</Text>
            <TouchableOpacity onPress={() => selectedItinerary && deleteItinerary(selectedItinerary.id)} style={styles.deleteButton}>
              <Ionicons name="trash" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itineraryDatesDetail}>{selectedItinerary?.startDate} - {selectedItinerary?.endDate}</Text>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {selectedItinerary?.days.map(day => (
              <View key={day.id} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayDate}>{day.date}</Text>
                  <TouchableOpacity onPress={() => deleteDay(day.id)}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                {day.activities.length === 0 && <Text style={styles.emptyText}>No activities yet.</Text>}
                {day.activities.map(activity => (
                  <View key={activity.id} style={styles.activityRow}>
                    <Text style={styles.activityText}>{activity.name}</Text>
                    <TouchableOpacity onPress={() => deleteActivity(day.id, activity.id)}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addActivityButton} onPress={() => { setSelectedDay(day); setActivityModalVisible(true); }}>
                  <Ionicons name="add-circle-outline" size={18} color="#0EA5E9" />
                  <Text style={styles.addActivityText}>Add Activity</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addDayButton} onPress={() => setDayModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={18} color="#0EA5E9" />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Day Modal */}
      <Modal visible={dayModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Day</Text>
            <TextInput
              style={styles.input}
              placeholder="Date (e.g. 2024-07-02)"
              value={newDayDate}
              onChangeText={setNewDayDate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDayModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addDay} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal visible={activityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Activity Name"
              value={newActivity}
              onChangeText={setNewActivity}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addActivity} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {calendarLoading && (
        <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Poppins-Bold',
  },
  addButton: {
    padding: 4,
  },
  itineraryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  itineraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  itineraryDates: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#374151',
    backgroundColor: '#F8FAFC',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '500',
    fontSize: 15,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#0EA5E9',
    fontWeight: '700',
    fontSize: 15,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryDatesDetail: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  dayCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'center',
    padding: 8,
  },
  addDayText: {
    color: '#0EA5E9',
    fontWeight: '600',
    fontSize: 15,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    padding: 6,
  },
  addActivityText: {
    color: '#0EA5E9',
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 