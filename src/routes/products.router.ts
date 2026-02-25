import { Router } from 'express';
import multer from 'multer';
import { ProductsService } from '../modules/products/products.service';
import { ProductsRepository } from '../modules/products/products.repository';
import { S3Service } from '../modules/s3/s3.service';
import prisma from '../configs/prisma';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const s3Service = new S3Service();
const productsRepository = new ProductsRepository(prisma);
const productsService = new ProductsService(productsRepository, s3Service);

router.get('/', async (req, res) => {
  const products = await productsService.findAll();
  res.json(products);
});

router.post('/', upload.single('image'), async (req, res) => {
  const createProductDto = req.body;
  const image = req.file;
  // TODO: Connect to S3 service to upload image
  console.log(image);
  const product = await productsService.create(createProductDto, image);
  res.status(201).json(product);
});

export default router;
