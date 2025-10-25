import mongoose from "mongoose";
import type { AuthorityUser } from "@/types";

const AuthorityUserSchema = new mongoose.Schema(
        {
                email: { type: String, unique: true, required: true },
                password_hash: { type: String, required: true },
                name: String,
                state: String,
                city: String,
                ward_ids: [String],
                dept_id: String,
                role: {
                        type: String,
                        enum: ["authority_admin"],
                        default: "authority_admin",
                },
        },
        { timestamps: true }
);

export default mongoose.models.AuthorityUser || mongoose.model("AuthorityUser", AuthorityUserSchema, "authorityusers");
