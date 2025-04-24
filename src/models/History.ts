import { Schema, model, Document } from "mongoose";

interface Segment {
  time: string;
  text: string;
}
export interface HistoryDoc extends Document {
  userId: string;
  segments: Segment[];
  createdAt: Date;
}

const HistorySchema = new Schema<HistoryDoc>({
  userId: { type: String, required: true },
  segments: [
    {
      time: { type: String, required: true },
      text: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: () => new Date() },
});

export default model<HistoryDoc>("History", HistorySchema);
