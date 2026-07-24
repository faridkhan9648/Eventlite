// Script to create sample events for testing
const mongoose = require('mongoose');
const Event = require('./dist/models/Event').Event;

// MongoDB connection
mongoose.connect('mongodb+srv://faridkhan:farid9648@cluster0.ygwzmul.mongodb.net/EventLite?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleEvents = [
  {
    title: 'Tech Conference 2024',
    description: 'Join us for the biggest technology conference of the year featuring the latest innovations in AI, cloud computing, and software development.',
    startDate: new Date('2024-12-15T09:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z'),
    location: 'Convention Center, San Francisco',
    maxAttendees: 500,
    currentAttendees: 0,
    status: 'published',
    createdBy: '654a1b2c3d4e5f6789012345', // Sample user ID
    tags: ['technology', 'conference', 'AI', 'cloud']
  },
  {
    title: 'Web Development Workshop',
    description: 'Learn the latest web development technologies including React, Node.js, and modern CSS frameworks in this hands-on workshop.',
    startDate: new Date('2024-12-20T10:00:00Z'),
    endDate: new Date('2024-12-20T16:00:00Z'),
    location: 'Tech Hub, New York',
    maxAttendees: 50,
    currentAttendees: 0,
    status: 'published',
    createdBy: '654a1b2c3d4e5f6789012345',
    tags: ['web development', 'React', 'Node.js', 'workshop']
  },
  {
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to investors and network with entrepreneurs in the startup ecosystem.',
    startDate: new Date('2024-12-25T18:00:00Z'),
    endDate: new Date('2024-12-25T21:00:00Z'),
    location: 'Innovation Center, Austin',
    maxAttendees: 200,
    currentAttendees: 0,
    status: 'published',
    createdBy: '654a1b2c3d4e5f6789012345',
    tags: ['startup', 'pitching', 'networking', 'investment']
  }
];

async function createSampleEvents() {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Create sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Created ${createdEvents.length} sample events:`);
    
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.location} - ${event.startDate.toLocaleDateString()}`);
    });

    mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating sample events:', error);
    mongoose.connection.close();
  }
}

createSampleEvents();
