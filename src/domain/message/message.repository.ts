import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../entity.repository';
import { Message, MessageDocument } from './message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Types } from 'mongoose';
import { UserDocument } from '../user/user.entity';

@Injectable()
export class MessageRepository extends EntityRepository<
  Message,
  MessageDocument
> {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  async findUnseenMessages(
    friendIds: string[],
    lastSeen: Date,
  ): Promise<MessageDocument[]> {
    return await this.messageModel
      .find({
        sender: { $in: friendIds.map((id) => new Types.ObjectId(id)) },
        createdAt: { $gte: lastSeen, $lte: new Date() },
      })
      .populate('sender', 'name')
      .exec();
  }
}
