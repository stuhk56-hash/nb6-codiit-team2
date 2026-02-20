generator client {
provider = "prisma-client"
output = "../generated/prisma"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model Login {
email String @id @default(cuid())
password String
}

model User {
id String @id @default(cuid())
name String
email String @unique
password String
type String
points Int
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
image String
message String
statusCode Int
errorCode Int
}

model Grade {
name String
id String @id @default(cuid())
rate Float
minAmount Int
}

model Store {
id String @id @default(cuid())
name String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
userId String
address String
phoneNumber String
content String
image String
productCount Int
favoriteCount Int
totalSoldCount Int
isDiscount Boolean
}

model Review {
id String @id @default(cuid())
userId String
productId String
orderItemId String
reviewId String
productName String
size String
items Int
price Int
quantity Int
total Int
page Int
limit Int
hasNextPage Boolean
data Int
meta String
totalPages Int
image String
reviewerName String
reviewCreatedAt DateTime @default(now())
purchasedAt DateTime
content String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
rate1Length Int
rate2Length Int
rate3Length Int
rate4Length Int
rate5Length Int
sumScore Int
rating Float
}

model Inquiry {
id String @id @default(cuid())
name String
title String
status String
isSecret Boolean
content String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
reply String
user String
list Int
totalCount Int
}

model Category {
name String
id String @id @default(cuid())
products Product[]
}

model Size {
id String @id @default(cuid())
name String
en String
ko String
sizeId String
quantity Int  
}

model Stock {
id String @id @default(cuid())
quantity Int
productId String
sizeId String
size String
}

model Product {
id String @id @default(cuid())
name String
image String
content String
discountRate Int
discountStartDate DateTime
discountEndDate DateTime
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
price Int
isSoldOut Boolean
statusCode Int
message String
error String
list Int
totalCount Int
}

model PickType {
name String
}

model OmitType {
id String @id @default(cuid())
name String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
userId String
address String
phoneNumber String
content String
image String
favoriteCount Int
}

model Cart {
id String @id @default(cuid())
storeId String
cartId String
productId String
sizeId String
buyerId String
quantity Int
name String
price Int
items Int
sizes String
image String
discountRate Int
discountStartDate DateTime
discountEndDate DateTime
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
reviewsRating Float
content String
}

model Order {
id String @id @default(cuid())
name String
image String
size String
price Int
phone String
address String
orderItems String
subtotal Int
totalQuantity Int
usePoint Int
reviews String
rating Int
total Int
page Int
limit Int
data Int
meta String
totalPages Int
content String
createdAt DateTime @default(now())
isReviewed Boolean
}

model Payment {
id String @id @default(cuid())
price Int
status String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
orderId String
}

model Sales {
totalOrders Int
totalSales Int
changeRate Float
previous Int
current Int
product String
}

model Price {
id String @id @default(cuid())
productId String
sizeId String
price Int
priceRange String
totalSales Int
percentage Float
}

model Dashboard {
today Int
week Int
month Int
year Int  
 topSales String
priceRange String
}

model Alarm {
id String @id @default(cuid())
userId String
content String
isChecked Boolean
list Int
totalCount Int
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}
