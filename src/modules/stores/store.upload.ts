import multer from 'multer';

const upload = multer();

export const storesUpload = upload.single('image');
