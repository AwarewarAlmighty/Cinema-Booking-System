import mongoose, { Document, Model, Schema } from 'mongoose';

// Your provided MongoDB URI
const MONGODB_URI = "mongodb+srv://zephylariuszl:8l7PZ4BY7RhcX6n5@cluster0.zlkr8jn.mongodb.net/cinema-booking";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// ============== INTERFACES ==============
export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string; // Storing hashed password
  role: 'user' | 'admin';
}

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string;
  duration: number;
  release_date: Date;
  poster_url: string;
  trailer_url?: string;
}

export interface IHall extends Document {
  hall_name: string;
  total_seats: number;
  layout_rows: number;
  layout_columns: number;
}

export interface IShowtime extends Document {
  movie: IMovie['_id'];
  hall: IHall['_id'];
  show_date: Date;
  start_time: string;
  end_time: string;
  ticket_price: number;
}

export interface IBooking extends Document {
  user: IUser['_id']; // Reference to the User model
  showtime: IShowtime['_id'];
  booking_date: Date;
  total_seats: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  selected_seats: string[];
}

export interface IPayment extends Document {
  booking: IBooking['_id'];
  payment_date: Date;
  amount: number;
  payment_method: string;
  status: 'success' | 'failed' | 'pending';
}

// ============== SCHEMAS ==============
const UserSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
}, { timestamps: true });

const MovieSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: Number, required: true },
  release_date: { type: Date, required: true },
  poster_url: { type: String, required: true },
  trailer_url: { type: String },
}, { timestamps: true });

const HallSchema: Schema = new Schema({
    hall_name: { type: String, required: true },
    total_seats: { type: Number, required: true },
    layout_rows: { type: Number, required: true },
    layout_columns: { type: Number, required: true },
}, { timestamps: true });

const ShowtimeSchema: Schema = new Schema({
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    hall: { type: Schema.Types.ObjectId, ref: 'Hall', required: true },
    show_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    ticket_price: { type: Number, required: true },
});

const BookingSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
    booking_date: { type: Date, default: Date.now },
    total_seats: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    selected_seats: [{ type: String, required: true }],
});

const PaymentSchema: Schema = new Schema({
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    payment_date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    payment_method: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
});

// ============== MODELS ==============
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Movie: Model<IMovie> = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
export const Hall: Model<IHall> = mongoose.models.Hall || mongoose.model<IHall>('Hall', HallSchema);
export const Showtime: Model<IShowtime> = mongoose.models.Showtime || mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);