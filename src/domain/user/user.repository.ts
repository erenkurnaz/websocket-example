import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EntityRepository } from '../entity.repository';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.entity';

@Injectable()
export class UserRepository extends EntityRepository<User, UserDocument> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<UserDocument> {
    return await this.userModel
      .findOne({ email })
      .select(includePassword && '+password')
      .exec();
  }

  async updateLastSeen(id: string | Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        $set: {
          lastSeen: new Date(),
        },
      })
      .select('lastSeen')
      .exec();
  }

  async addToFriends(
    userId: string,
    friendId: string,
  ): Promise<UserDocument[]> {
    return await Promise.all([
      this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $push: { friends: new Types.ObjectId(friendId) },
          },
          { new: true },
        )
        .exec(),
      this.userModel
        .findByIdAndUpdate(
          friendId,
          {
            $push: { friends: new Types.ObjectId(userId) },
          },
          { new: true },
        )
        .exec(),
    ]);
  }
}
