import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  rating: number;
}
