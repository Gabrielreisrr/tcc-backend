import { Schema, model, Document } from "mongoose";

interface Segment {
  time: string;
  text: string;
}

export interface HistoryDoc extends Document {
  userId: string;
  title: string;
  type: "video" | "audio";
  url?: string;
  segments: Segment[];
  summary?: string;
  enhancedText?: string;
  createdAt: Date;
}

const HistorySchema = new Schema<HistoryDoc>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String },
  segments: [
    {
      time: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
  summary: { type: String },
  enhancedText: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});

export default model<HistoryDoc>("History", HistorySchema);
