import { Document, Schema } from "mongoose";

export interface IBootcamp {
  name: string;
  slug: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string | undefined;
  location: Object;
  careers: string[];
  averageRating: number;
  averageCost: number;
  photo: string;
  housing: boolean;
  jobAssistance: boolean;
  jobGuarantee: boolean;
  acceptGi: boolean;
  user: string;
}

export interface IBootcampDocument extends IBootcamp, Document {
  createdAt: Date;
  updatedAt: Date;
}
