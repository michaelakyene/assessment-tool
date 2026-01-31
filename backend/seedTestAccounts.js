const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testAccounts = [
  {
    name: 'John Student',
    email: 'student@test.com',
    password: 'student123',
    role: 'student',
    studentId: 'S123456'
  },
  {
    name: 'Dr. Jane Lecturer',
    email: 'lecturer@test.com',
    password: 'lecturer123',
    role: 'lecturer'
  }
];

async function seedTestAccounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing test accounts
    await User.deleteMany({ 
      email: { $in: testAccounts.map(acc => acc.email) } 
    });
    console.log('Cleared existing test accounts');

    // Create test accounts
    for (const account of testAccounts) {
      const user = new User(account);
      await user.save();
      console.log(`✅ Created ${account.role}: ${account.email} / ${account.password}`);
    }

    console.log('\n🎉 Test accounts created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━'.repeat(50));
    console.log('STUDENT ACCOUNT:');
    console.log('  Email: student@test.com');
    console.log('  Password: student123');
    console.log('  Student ID: S123456');
    console.log('━'.repeat(50));
    console.log('LECTURER ACCOUNT:');
    console.log('  Email: lecturer@test.com');
    console.log('  Password: lecturer123');
    console.log('━'.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test accounts:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// DISABLED FOR PRODUCTION - Auto-seeding test accounts disabled
// seedTestAccounts();

// To clear test data manually, run in MongoDB Atlas console:
// db.users.deleteMany({ email: { $in: ['john@example.com', 'jane@example.com', ...] } })
// db.quizzes.deleteMany({})
// db.attempts.deleteMany({})

module.exports = seedTestAccounts;
