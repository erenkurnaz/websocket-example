import { Document, Model } from 'mongoose';

export abstract class EntityRepository<T, D extends Document> {
  protected constructor(protected readonly entityModel: Model<D>) {}

  async create(entity: T): Promise<D> {
    return this.entityModel.create(entity);
  }

  async updateOne(id: string, entity: T): Promise<D> {
    return this.entityModel.findByIdAndUpdate(id, entity).exec();
  }

  async findAll(): Promise<D[]> {
    return this.entityModel.find().exec();
  }

  async findById(id: string): Promise<D | null> {
    return this.entityModel.findById(id).exec();
  }

  async clearCollection(): Promise<void> {
    await this.entityModel.deleteMany({});
  }
}
