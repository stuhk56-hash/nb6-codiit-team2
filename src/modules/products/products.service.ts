<<<<<<< HEAD
=======
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsRepository } from './products.repository';
import { S3Service } from '../s3/s3.service';

export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly s3Service: S3Service,
  ) {}

  findAll() {
    return this.productsRepository.findAll();
  }

  async create(
    createProductDto: CreateProductDto,
    image: Express.Multer.File,
  ) {
    // TODO: get storeId from authenticated user
    const storeId = 'some-store-id';
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.s3Service.uploadFile(image);
    }
    return this.productsRepository.create(createProductDto, storeId, imageUrl);
  }
}
>>>>>>> origin/dev
