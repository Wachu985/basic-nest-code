import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, type: String, required: true })
  email: string;

  @Prop({ type: SchemaTypes.String, required: true, select: false })
  password: string;

  @Prop({ type: SchemaTypes.String, required: true })
  fullName: string;

  @Prop({ type: SchemaTypes.Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [SchemaTypes.String], default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
