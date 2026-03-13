import multer from 'multer';

const upload = multer();

export const productsUpload = upload.single('image');
