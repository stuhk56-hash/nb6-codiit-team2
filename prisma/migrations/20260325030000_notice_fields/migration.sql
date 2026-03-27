-- AlterTable
ALTER TABLE "Store"
ADD COLUMN "businessRegistrationNumber" TEXT,
ADD COLUMN "businessPhoneNumber" TEXT,
ADD COLUMN "mailOrderSalesNumber" TEXT,
ADD COLUMN "representativeName" TEXT,
ADD COLUMN "businessAddress" TEXT;

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "material" TEXT,
ADD COLUMN "color" TEXT,
ADD COLUMN "manufacturerName" TEXT,
ADD COLUMN "manufactureCountry" TEXT,
ADD COLUMN "manufactureDate" TEXT,
ADD COLUMN "caution" TEXT,
ADD COLUMN "qualityGuaranteeStandard" TEXT,
ADD COLUMN "asManagerName" TEXT,
ADD COLUMN "asPhoneNumber" TEXT,
ADD COLUMN "shippingFee" INTEGER,
ADD COLUMN "extraShippingFee" INTEGER,
ADD COLUMN "shippingCompany" TEXT,
ADD COLUMN "deliveryPeriod" TEXT,
ADD COLUMN "returnExchangePolicy" TEXT,
ADD COLUMN "returnShippingFee" INTEGER,
ADD COLUMN "exchangeShippingFee" INTEGER;
