import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

export default mongoose.model('PasswordResetToken', schema);
