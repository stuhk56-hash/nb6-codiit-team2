import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        stocks: {
          include: {
            size: true,
          },
        },
      },
    });
  }

  async create(createProductDto: CreateProductDto, storeId: string, imageUrl?: string) {
    const {
      name,
      price,
      content,
      categoryName,
      stocks,
      discountRate,
      discountStartTime,
      discountEndTime,
    } = createProductDto;

    return this.prisma.product.create({
      data: {
        name,
        price,
        content,
        storeId,
        image: imageUrl,
        discountRate,
        discountStartTime: discountStartTime ? new Date(discountStartTime) : null,
        discountEndTime: discountEndTime ? new Date(discountEndTime) : null,
        category: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName },
          },
        },
        stocks: {
          create: stocks.map((stock) => ({
            quantity: stock.quantity,
            size: {
              connectOrCreate: {
                where: { name: stock.size },
                create: { name: stock.size },
              },
            },
          })),
        },
      },
    });
  }
}