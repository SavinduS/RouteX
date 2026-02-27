const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // 1. Readable Order ID එක සඳහා field එක
  order_id: { 
    type: String, 
    unique: true 
  },
  
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["available", "assigned", "picked_up", "in_transit"],
    default: "available",
  },
  vehicle_type: { type: String, required: true },
  package_size: { type: String, enum: ["small", "medium", "large"], required: true },
  
  receiver_name: { type: String, required: true },
  receiver_phone: { type: String, required: true },
  
  pickup_address: { type: String, required: true },
  pickup_lat: { type: Number, required: true },
  pickup_lng: { type: Number, required: true },
  dropoff_address: { type: String, required: true },
  dropoff_lat: { type: Number, required: true },
  dropoff_lng: { type: Number, required: true },
  
  distance_km: { type: Number, required: true },
  total_cost: { type: Number, required: true },
  
  expected_delivery_time: { type: Date },
  is_delayed: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// --- අලුත් Order ID Generate කරන Logic එක (Updated) ---
orderSchema.pre("save", async function () {
  const doc = this;

  // 1. දැනටමත් order_id එකක් තිබේ නම් අලුතෙන් හදන්න ඕන නෑ
  if (doc.order_id) return;

  try {
    // 2. අද දවසට අදාළ කොටස (YYMMDD)
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const datePart = `${yy}${mm}${dd}`; 

    // 3. අද දවසේ දාපු අන්තිම ඕඩර් එක සොයමු
    // "this.constructor" පාවිච්චි කරන්නේ Model එක හරියටම access කරන්න
    const lastOrder = await this.constructor.findOne({
      order_id: { $regex: new RegExp(`^ODR-${datePart}-`) }
    }).sort({ order_id: -1 }); // අලුත්ම ID එක මුලට ගන්නවා

    let newSeq = 1;

    if (lastOrder && lastOrder.order_id) {
      // අන්තිම ඕඩර් එකේ අංකය (අන්තිම ඉලක්කම් 3) අරන් 1ක් එකතු කරනවා
      const parts = lastOrder.order_id.split("-");
      const lastSeqString = parts[2]; 
      newSeq = parseInt(lastSeqString) + 1;
    }

    // 4. Sequential අංකය 001 විදියට හදනවා
    const seqPart = newSeq.toString().padStart(3, '0');

    // 5. අවසාන ID එක doc එකට දානවා
    doc.order_id = `ODR-${datePart}-${seqPart}`;
    
  } catch (error) {
    throw error; // මෙතනදී Error එක throw කළාම Mongoose ඒක catch කරගන්නවා
  }
});

module.exports = mongoose.model("Order", orderSchema);