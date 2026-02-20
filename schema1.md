generator client {
provider = "prisma-client"
output = "../generated/prisma"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model Product {
id String @id @default(cuid())
name String
price Int
content String?
image String?
discountRate Int?
discountStartTime DateTime?
discountEndTime DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
storeId String
categoryId String
category Category @relation(fields: [categoryId], references: [id])
stocks Stock[]
inquiries Inquiry[]
}

model Category {
id String @id @default(cuid())
name String @unique
products Product[]
}

model Stock {
id String @id @default(cuid())
quantity Int
productId String
product Product @relation(fields: [productId], references: [id])
sizeId Int
size Size @relation(fields: [sizeId], references: [id])
}

model Size {
id Int @id @default(autoincrement())
name String @unique
stocks Stock[]
}

model User {
id String @id @default(cuid())
name String
email String @unique
customerInquiries Inquiry[] @relation("customerInquiries")
storeReplies InquiryReply[] @relation("storeReplies")
}

enum InquiryStatus {
Pending
CompletedAnswer
}

model Inquiry {
id String @id @default(cuid())
title String
content String
status InquiryStatus @default(Pending)
isSecret Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
productId String
product Product @relation(fields: [productId], references: [id])
authorId String?
author User? @relation("customerInquiries", fields: [authorId], references: [id])
customerName String?
customerEmail String?
reply InquiryReply?
}

model InquiryReply {
id String @id @default(cuid())
content String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
inquiryId String @unique
inquiry Inquiry @relation(fields: [inquiryId], references: [id])
authorId String
author User @relation("storeReplies", fields: [authorId], references: [id])
}
