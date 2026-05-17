const User = require('./models/User');
const Room = require('./models/Room');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // 1. Check if we have any users, if not create a default owner
        let defaultOwner = await User.findOne({ email: 'owner@studynook.com' });
        if (!defaultOwner) {
            const hashedPassword = await bcrypt.hash('Password123', 10);
            defaultOwner = new User({
                name: 'Sarah Jenkins (Library Admin)',
                email: 'owner@studynook.com',
                password: hashedPassword,
                photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                role: 'user'
            });
            await defaultOwner.save();
            console.log('Default owner seeded successfully');
        }

        // 2. Check if we have any rooms, if not insert 6 premium rooms
        const roomCount = await Room.countDocuments();
        if (roomCount === 0) {
            const dummyRooms = [
                {
                    name: 'The Glass Pavilion',
                    description: 'A beautiful, quiet glass-walled study room with views of the campus garden. Features an interactive smart board and cozy ergonomic chairs.',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
                    floor: '3rd Floor',
                    capacity: 6,
                    hourlyRate: 8,
                    amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 12
                },
                {
                    name: 'Silent Pod Alpha',
                    description: 'Soundproofed personal workspace designed for high-focus studying and exam prep. Equipped with high-speed fiber internet and dimmable soft lighting.',
                    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600',
                    floor: 'Basement Quiet Zone',
                    capacity: 2,
                    hourlyRate: 5,
                    amenities: ['Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 24
                },
                {
                    name: 'Creative Collaborative Hub',
                    description: 'Perfect for group brainstorming sessions, presentations, and group projects. Features a massive 4K TV screen, double-sided whiteboard, and movable tables.',
                    image: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600',
                    floor: '2nd Floor',
                    capacity: 8,
                    hourlyRate: 10,
                    amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 5
                },
                {
                    name: 'Zen Corner Room',
                    description: 'A cozy corner room lined with books and comfortable bean bags. Perfect for relaxed reading, research, or small group reviews.',
                    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600',
                    floor: '4th Floor Room 402',
                    capacity: 4,
                    hourlyRate: 6,
                    amenities: ['Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 8
                },
                {
                    name: 'Cyber Lab Study Suite',
                    description: 'State-of-the-art room featuring dual-monitor computer workstations. Ideal for computer science students, researchers, or data analysis.',
                    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
                    floor: '3rd Floor Lab Area',
                    capacity: 4,
                    hourlyRate: 12,
                    amenities: ['Wi-Fi', 'Power Outlets', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 15
                },
                {
                    name: 'The Boardroom Study Area',
                    description: 'A formal workspace tailored for student organizations, presentations, or executive student meetings. Premium mahogany table and videoconferencing suite.',
                    image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600',
                    floor: '1st Floor Executive Wing',
                    capacity: 12,
                    hourlyRate: 15,
                    amenities: ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Air Conditioning'],
                    owner: defaultOwner._id,
                    bookingCount: 3
                }
            ];

            await Room.insertMany(dummyRooms);
            console.log('Database seeded with 6 premium study rooms successfully!');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = seedDatabase;
