import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.entity';

export interface MessageDocument extends Message, Document {}

const handleSenderId = (id: string | Types.ObjectId) => {
  return typeof id === 'string' ? new Types.ObjectId(id) : id;
};

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: true,
  },
})
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    set: handleSenderId,
  })
  sender: User | Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  message: string;

  createdAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ sender: 1, createdAt: -1 }, { unique: true });
