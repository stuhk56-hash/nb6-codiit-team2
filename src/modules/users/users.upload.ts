import multer from 'multer';

const upload = multer();

export const usersUpload = upload.single('image');
