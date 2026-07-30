import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User", required: true 
    },
    role: { 
        type: String, 
        enum: ["owner", "member"], 
        default: "member" 
    },
    joinedAt: { 
        type: Date, 
        default: Date.now 
    },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    members: [teamMemberSchema],
    inviteCode: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;