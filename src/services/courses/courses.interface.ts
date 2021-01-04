import { Document } from "mongoose";

export enum Skill {
  BEGINNER = 1,
  INTERMEDIATE,
  ADVANCED,
}

export interface ICourse {
  title: string;
  description: string;
  weeks: string;
  tuition: number;
  minimumSkill: Skill;
  schoolarship: boolean;
  bootcamp: string;
  user: string;
}

export interface ICourseDocument extends ICourse, Document {
  createdAt: Date;
  updatedAt: Date;
}
