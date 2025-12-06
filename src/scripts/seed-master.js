// scripts/seed-master-admin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

interface User {
  email: string;
  password: string;
  name: string;
  role: 'master_admin' | 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

async function seedMasterAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const UserModel = mongoose.model<User>('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { 
        type: String, 
        enum: ['master_admin', 'admin', 'user'], 
        default: 'user' 
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));

    // Vérifier si le master admin existe déjà
    const existingAdmin = await UserModel.findOne({ 
      email: 'israbogninou@gmail.com' 
    });

    if (existingAdmin) {
      console.log('⚠️ Master admin existe déjà');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      await mongoose.disconnect();
      return;
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('VotreMotDePasseSecret123', salt);

    // Créer le master admin
    const masterAdmin = new UserModel({
      email: 'israbogninou@gmail.com',
      password: hashedPassword,
      name: 'Master Admin',
      role: 'master_admin'
    });

    await masterAdmin.save();
    
    console.log('✅ Master admin créé avec succès!');
    console.log('Email: israbogninou@gmail.com');
    console.log('Role: master_admin');
    console.log('Mot de passe: VotreMotDePasseSecret123');
    console.log('⚠️ Changez ce mot de passe immédiatement après la première connexion!');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
seedMasterAdmin();