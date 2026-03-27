import type {
  CreateStoreRecordInput,
  UpdateStoreRecordInput,
  UploadedStoreImage,
} from '../types/stores.type';
import type { CreateStoreDto, UpdateStoreDto } from '../dto/create-store.dto';

function toUploadedImagePayload(uploadedImage: UploadedStoreImage) {
  if (!uploadedImage) {
    return {};
  }

  return {
    imageUrl: uploadedImage.url,
    imageKey: uploadedImage.key,
  };
}

export function toCreateStoreRecordInput(params: {
  sellerId: string;
  data: CreateStoreDto;
  uploadedImage?: UploadedStoreImage;
}): CreateStoreRecordInput {
  const { sellerId, data, uploadedImage } = params;

  return {
    sellerId,
    ...data,
    ...toUploadedImagePayload(uploadedImage),
  };
}

export function toUpdateStoreRecordInput(params: {
  data: UpdateStoreDto;
  uploadedImage?: UploadedStoreImage;
}): UpdateStoreRecordInput {
  const { data, uploadedImage } = params;

  return {
    ...data,
    ...toUploadedImagePayload(uploadedImage),
  };
}
