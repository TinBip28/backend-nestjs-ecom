import mongoose from 'mongoose';

export interface IUser {
  _id: string | mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
  store?: {
    _id: string;
    name: string;
  };
}

export interface IUSerGoogle {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export type UserDiagram = {
  _id: string;
  name: string;
  email: string;
  gender: string;
  address: string;
  role?: {
    name: string;
    _id: string;
  };
  brandID: {
    _id: string;
    name: string;
  };
};
