import mongoose, { Schema, type InferSchemaType, model, models } from "mongoose";
import { DEFAULT_THEME_ID } from "../themes";

const profileSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    bio: { type: String, trim: true },
    avatarUrl: { type: String },
    themeId: { type: String, default: DEFAULT_THEME_ID },
    socials: {
      type: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    featuredImageUrl: { type: String },
    featuredText: { type: String, trim: true },
  },
);

profileSchema.index({ username: 1 }, { unique: true });

const linkSchema = new Schema(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    url: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String },
    position: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0, min: 0 },
  },
);

linkSchema.index({ profileId: 1 });

const clickSchema = new Schema(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    linkId: { type: Schema.Types.ObjectId, ref: "Link", required: true },
    timestamp: { type: Date, default: Date.now },
  },
);

clickSchema.index({ profileId: 1, linkId: 1 });

export type Profile = InferSchemaType<typeof profileSchema>;
export type Link = InferSchemaType<typeof linkSchema>;
export type Click = InferSchemaType<typeof clickSchema>;

export const Profile =
  (models.Profile as mongoose.Model<Profile>) ??
  model<Profile>("Profile", profileSchema);
export const Link =
  (models.Link as mongoose.Model<Link>) ?? model<Link>("Link", linkSchema);
export const Click =
  (models.Click as mongoose.Model<Click>) ??
  model<Click>("Click", clickSchema);

export { profileSchema, linkSchema, clickSchema };