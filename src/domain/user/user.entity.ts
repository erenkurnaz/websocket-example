import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { errorMessages } from '../../error/error-messages';

export interface UserDocument extends User, Document {
  validatePassword: (password: string) => Promise<boolean>;
}

@Schema({
  versionKey: false,
  strict: 'throw',
})
export class User {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  surname?: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
    set: (ids: string[]) => ids.map((id) => new Types.ObjectId(id)),
  })
  friends: string[] | Types.ObjectId[];

  @Prop({
    type: Date,
    default: new Date(),
  })
  lastSeen?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  const result = await bcrypt.compare(password, this.password);
  if (!result) throw new UnauthorizedException(errorMessages.WRONG_PASSWORD);

  return result;
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  next();
});
