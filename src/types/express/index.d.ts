import { Request } from 'express';
import multer from 'multer';

declare global {
  namespace Express {
   
    interface Request {
      userId?: string; 
      file?: Express.Multer.File; 
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }; // multiple files
    }
  }
}
