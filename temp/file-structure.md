# File Structure

## Project Root ()
```text
.
./_http
./_http/health.http
./_http/products.http
./_http/store.http
./_http/user.http
./_project
./_project/코드 작성 규칙.md
./_project/API 명세서
./_project/API 명세서/대시보드
./_project/API 명세서/등급
./_project/API 명세서/리뷰
./_project/API 명세서/상품
./_project/API 명세서/스토어
./_project/API 명세서/유저
./_project/API 명세서/인증
./_project/API 명세서/장바구니
./_project/API 명세서/주문
./_project/API 명세서/인증/Auth-1.png
./_project/API 명세서/인증/Auth-2.png
./_project/API 명세서/인증/Auth-3.png
./_project/API 명세서/인증/Auth-4.png
./_project/API 명세서/인증/Auth-5.png
./_project/API 명세서/인증/Auth-6.png
./_project/API 명세서/인증/Auth-7.png
./_project/API 명세서/장바구니/ct-1.png
./_project/API 명세서/장바구니/ct-10.png
./_project/API 명세서/장바구니/ct-11.png
./_project/API 명세서/장바구니/ct-12.png
./_project/API 명세서/장바구니/ct-13.png
./_project/API 명세서/장바구니/ct-14.png
./_project/API 명세서/장바구니/ct-15.png
./_project/API 명세서/장바구니/ct-2.png
./_project/API 명세서/장바구니/ct-3.png
./_project/API 명세서/장바구니/ct-4.png
./_project/API 명세서/장바구니/ct-5.png
./_project/API 명세서/장바구니/ct-6.png
./_project/API 명세서/장바구니/ct-7.png
./_project/API 명세서/장바구니/ct-8.png
./_project/API 명세서/장바구니/ct-9.png
./_project/API 명세서/대시보드/db-1.png
./_project/API 명세서/대시보드/db-2.png
./_project/API 명세서/등급/md-1.png
./_project/API 명세서/주문/od-1.png
./_project/API 명세서/주문/od-10.png
./_project/API 명세서/주문/od-11.png
./_project/API 명세서/주문/od-12.png
./_project/API 명세서/주문/od-13.png
./_project/API 명세서/주문/od-14.png
./_project/API 명세서/주문/od-15.png
./_project/API 명세서/주문/od-16.png
./_project/API 명세서/주문/od-17.png
./_project/API 명세서/주문/od-2.png
./_project/API 명세서/주문/od-3.png
./_project/API 명세서/주문/od-4.png
./_project/API 명세서/주문/od-5.png
./_project/API 명세서/주문/od-6.png
./_project/API 명세서/주문/od-7.png
./_project/API 명세서/주문/od-8.png
./_project/API 명세서/주문/od-9.png
./_project/API 명세서/상품/pd-1.png
./_project/API 명세서/상품/pd-10.png
./_project/API 명세서/상품/pd-11.png
./_project/API 명세서/상품/pd-12.png
./_project/API 명세서/상품/pd-13.png
./_project/API 명세서/상품/pd-14.png
./_project/API 명세서/상품/pd-15.png
./_project/API 명세서/상품/pd-16.png
./_project/API 명세서/상품/pd-17.png
./_project/API 명세서/상품/pd-18.png
./_project/API 명세서/상품/pd-19.png
./_project/API 명세서/상품/pd-2.png
./_project/API 명세서/상품/pd-20.png
./_project/API 명세서/상품/pd-21.png
./_project/API 명세서/상품/pd-3.png
./_project/API 명세서/상품/pd-4.png
./_project/API 명세서/상품/pd-5.png
./_project/API 명세서/상품/pd-6.png
./_project/API 명세서/상품/pd-7.png
./_project/API 명세서/상품/pd-8.png
./_project/API 명세서/상품/pd-9.png
./_project/API 명세서/리뷰/rv-1.png
./_project/API 명세서/리뷰/rv-10.png
./_project/API 명세서/리뷰/rv-11.png
./_project/API 명세서/리뷰/rv-12.png
./_project/API 명세서/리뷰/rv-13.png
./_project/API 명세서/리뷰/rv-14.png
./_project/API 명세서/리뷰/rv-2.png
./_project/API 명세서/리뷰/rv-3.png
./_project/API 명세서/리뷰/rv-4.png
./_project/API 명세서/리뷰/rv-5.png
./_project/API 명세서/리뷰/rv-6.png
./_project/API 명세서/리뷰/rv-7.png
./_project/API 명세서/리뷰/rv-8.png
./_project/API 명세서/리뷰/rv-9.png
./_project/API 명세서/스토어/st-1.png
./_project/API 명세서/스토어/st-10.png
./_project/API 명세서/스토어/st-11.png
./_project/API 명세서/스토어/st-12.png
./_project/API 명세서/스토어/st-13.png
./_project/API 명세서/스토어/st-14.png
./_project/API 명세서/스토어/st-15.png
./_project/API 명세서/스토어/st-2.png
./_project/API 명세서/스토어/st-3.png
./_project/API 명세서/스토어/st-4.png
./_project/API 명세서/스토어/st-5.png
./_project/API 명세서/스토어/st-6.png
./_project/API 명세서/스토어/st-7.png
./_project/API 명세서/스토어/st-8.png
./_project/API 명세서/스토어/st-9.png
./_project/API 명세서/유저/User-1.png
./_project/API 명세서/유저/User-10.png
./_project/API 명세서/유저/User-11.png
./_project/API 명세서/유저/User-12.png
./_project/API 명세서/유저/User-13.png
./_project/API 명세서/유저/User-14.png
./_project/API 명세서/유저/User-15.png
./_project/API 명세서/유저/User-2.png
./_project/API 명세서/유저/User-3.png
./_project/API 명세서/유저/User-4.png
./_project/API 명세서/유저/User-5.png
./_project/API 명세서/유저/User-6.png
./_project/API 명세서/유저/User-7.png
./_project/API 명세서/유저/User-8.png
./_project/API 명세서/유저/User-9.png
./_project/API 명세서/S3
./_project/API 명세서/S3/S3-1.png
./_project/API 명세서/S3/S3-2.png
./_project/Git-Convention.md
./_project/TypeScript-Convention.md
./.dockerignore
./.env
./.github
./.github/workflows
./.github/workflows/cd.yml
./.github/workflows/ci.yml
./.gitignore
./.prettierrc.json
./.vscode
./.vscode/settings.json
./docker-compose.yml
./Dockerfile
./entrypoint.sh
./ERD 
./ERD /erd.png
./ERD /erd1.png
./ERD /image.png
./infra
./infra/ecosystem.config.js
./infra/start.sh
./jest.config.js
./package-lock.json
./package.json
./prisma
./prisma/schema.prisma
./project-codiit-fe
./project-codiit-fe/.github
./project-codiit-fe/.github/ISSUE_TEMPLATE
./project-codiit-fe/.github/ISSUE_TEMPLATE/issue_template.md
./project-codiit-fe/.github/PULL_REQUEST_TEMPLATE.md
./project-codiit-fe/.github/workflows
./project-codiit-fe/.github/workflows/vercel-deploy.yml
./project-codiit-fe/.gitignore
./project-codiit-fe/.prettierignore
./project-codiit-fe/.prettierrc
./project-codiit-fe/eslint.config.mjs
./project-codiit-fe/next.config.ts
./project-codiit-fe/package-lock.json
./project-codiit-fe/package.json
./project-codiit-fe/postcss.config.mjs
./project-codiit-fe/public
./project-codiit-fe/public/icon
./project-codiit-fe/public/icon_check.svg
./project-codiit-fe/public/icon/AltArrowDown.svg
./project-codiit-fe/public/icon/arrowBottom.svg
./project-codiit-fe/public/icon/arrowLeft.svg
./project-codiit-fe/public/icon/arrowRight.svg
./project-codiit-fe/public/icon/bell.svg
./project-codiit-fe/public/icon/bxs-edit.svg
./project-codiit-fe/public/icon/checkbox_blank.svg
./project-codiit-fe/public/icon/checkBox.svg
./project-codiit-fe/public/icon/delete.svg
./project-codiit-fe/public/icon/deleteBlack.svg
./project-codiit-fe/public/icon/edit.svg
./project-codiit-fe/public/icon/gallery.svg
./project-codiit-fe/public/icon/heart_empty.svg
./project-codiit-fe/public/icon/heart.svg
./project-codiit-fe/public/icon/icon_arrow_right.svg
./project-codiit-fe/public/icon/icon_delete.svg
./project-codiit-fe/public/icon/icon_heart.svg
./project-codiit-fe/public/icon/icon_lock.svg
./project-codiit-fe/public/icon/image_fail.svg
./project-codiit-fe/public/icon/incart.svg
./project-codiit-fe/public/icon/logo.svg
./project-codiit-fe/public/icon/minus.svg
./project-codiit-fe/public/icon/plus.svg
./project-codiit-fe/public/icon/search.svg
./project-codiit-fe/public/icon/starGray.svg
./project-codiit-fe/public/icon/starYellow.svg
./project-codiit-fe/public/images
./project-codiit-fe/public/images/Mask-group.svg
./project-codiit-fe/public/images/profile-buyer.png
./project-codiit-fe/public/images/profile-seller.png
./project-codiit-fe/public/images/sample-store.png
./project-codiit-fe/README.md
./project-codiit-fe/src
./project-codiit-fe/src/app
./project-codiit-fe/src/app/(routes)
./project-codiit-fe/src/app/error.tsx
./project-codiit-fe/src/app/layout.tsx
./project-codiit-fe/src/app/login
./project-codiit-fe/src/app/not-found.tsx
./project-codiit-fe/src/app/page.tsx
./project-codiit-fe/src/app/providers.tsx
./project-codiit-fe/src/app/setting
./project-codiit-fe/src/app/signup
./project-codiit-fe/src/components
./project-codiit-fe/src/components/button
./project-codiit-fe/src/components/buyer
./project-codiit-fe/src/components/CategoryNav.tsx
./project-codiit-fe/src/components/divider
./project-codiit-fe/src/components/gnb
./project-codiit-fe/src/components/input
./project-codiit-fe/src/components/item
./project-codiit-fe/src/components/Modal.tsx
./project-codiit-fe/src/components/mypage
./project-codiit-fe/src/components/MyPageMenu.tsx
./project-codiit-fe/src/components/order
./project-codiit-fe/src/components/select
./project-codiit-fe/src/components/seller
./project-codiit-fe/src/components/shopping
./project-codiit-fe/src/components/Tab.tsx
./project-codiit-fe/src/data
./project-codiit-fe/src/data/buyerMenuItems.ts
./project-codiit-fe/src/data/buyermypageinterest.ts
./project-codiit-fe/src/data/buyermypagePurchase.ts
./project-codiit-fe/src/data/buyerPurchase.ts
./project-codiit-fe/src/data/CartProductOption.ts
./project-codiit-fe/src/data/inquiryTabList.ts
./project-codiit-fe/src/data/level.ts
./project-codiit-fe/src/data/MypageUser.ts
./project-codiit-fe/src/data/orderProducts.ts
./project-codiit-fe/src/data/reviewTabList.ts
./project-codiit-fe/src/data/sellerMenuItems.ts
./project-codiit-fe/src/hooks
./project-codiit-fe/src/hooks/useIntersection.ts
./project-codiit-fe/src/lib
./project-codiit-fe/src/lib/api
./project-codiit-fe/src/lib/functions
./project-codiit-fe/src/lib/schemas
./project-codiit-fe/src/proviers
./project-codiit-fe/src/proviers/toaster
./project-codiit-fe/src/store
./project-codiit-fe/src/store/orderStore.ts
./project-codiit-fe/src/stores
./project-codiit-fe/src/stores/searchOptionStore.ts
./project-codiit-fe/src/stores/useApiStore.ts
./project-codiit-fe/src/stores/userStore.ts
./project-codiit-fe/src/styles
./project-codiit-fe/src/styles/globals.css
./project-codiit-fe/src/styles/scrollbar.module.css
./project-codiit-fe/src/styles/textviewer.css
./project-codiit-fe/src/types
./project-codiit-fe/src/types/auth.d.ts
./project-codiit-fe/src/types/buyerPurchase.d.ts
./project-codiit-fe/src/types/cart.ts
./project-codiit-fe/src/types/CartItem.ts
./project-codiit-fe/src/types/dashboard.ts
./project-codiit-fe/src/types/event-source-polyfill.d.ts
./project-codiit-fe/src/types/grade.ts
./project-codiit-fe/src/types/inquiry.ts
./project-codiit-fe/src/types/notification.ts
./project-codiit-fe/src/types/order.ts
./project-codiit-fe/src/types/Product.ts
./project-codiit-fe/src/types/purchase.ts
./project-codiit-fe/src/types/Review.ts
./project-codiit-fe/src/types/sellerProduct.ts
./project-codiit-fe/src/types/store.ts
./project-codiit-fe/src/types/User.ts
./project-codiit-fe/src/utils
./project-codiit-fe/src/utils/formData
./project-codiit-fe/src/utils/productDetailToFormValues.ts
./project-codiit-fe/tsconfig.json
./README.md
./src
./src/app.module.ts
./src/configs
./src/configs/cors.ts
./src/configs/env.ts
./src/configs/prisma.ts
./src/configs/swagger.ts
./src/errors
./src/errors/async-handler.ts
./src/errors/debug.ts
./src/errors/error-handler.ts
./src/errors/logger.ts
./src/main.ts
./src/middlewares
./src/middlewares/auth.middleware.ts
./src/middlewares/logger.middleware.ts
./src/middlewares/validate.middleware.ts
./src/modules
./src/modules/auth
./src/modules/auth/auth.controller.ts
./src/modules/auth/auth.module.ts
./src/modules/auth/auth.service.ts
./src/modules/auth/dto
./src/modules/cart
./src/modules/cart/cart.controller.ts
./src/modules/cart/cart.module.ts
./src/modules/cart/cart.repository.ts
./src/modules/cart/cart.service.ts
./src/modules/cart/dto
./src/modules/cart/entities
./src/modules/common
./src/modules/common/decorators
./src/modules/common/guards
./src/modules/dashboard
./src/modules/dashboard/dashboard.controller.ts
./src/modules/dashboard/dashboard.module.ts
./src/modules/dashboard/dashboard.service.ts
./src/modules/dashboard/dto
./src/modules/inquiries
./src/modules/inquiries/dto
./src/modules/inquiries/entities
./src/modules/inquiries/inquiries.controller.ts
./src/modules/inquiries/inquiries.module.ts
./src/modules/inquiries/inquiries.repository.ts
./src/modules/inquiries/inquiries.service.ts
./src/modules/metadata
./src/modules/metadata/dto
./src/modules/metadata/metadata.controller.ts
./src/modules/metadata/metadata.module.ts
./src/modules/metadata/metadata.service.ts
./src/modules/notifications
./src/modules/notifications/dto
./src/modules/notifications/entities
./src/modules/notifications/notifications.controller.ts
./src/modules/notifications/notifications.gateway.ts
./src/modules/notifications/notifications.module.ts
./src/modules/notifications/notifications.repository.ts
./src/modules/notifications/notifications.service.ts
./src/modules/orders
./src/modules/orders/dto
./src/modules/orders/entities
./src/modules/orders/orders.controller.ts
./src/modules/orders/orders.module.ts
./src/modules/orders/orders.repository.ts
./src/modules/orders/orders.service.ts
./src/modules/products
./src/modules/products/dto
./src/modules/products/entities
./src/modules/products/products.controller.ts
./src/modules/products/products.module.ts
./src/modules/products/products.repository.ts
./src/modules/products/products.service.ts
./src/modules/reviews
./src/modules/reviews/dto
./src/modules/reviews/entities
./src/modules/reviews/reviews.controller.ts
./src/modules/reviews/reviews.module.ts
./src/modules/reviews/reviews.repository.ts
./src/modules/reviews/reviews.service.ts
./src/modules/s3
./src/modules/s3/s3.controller.ts
./src/modules/s3/s3.module.ts
./src/modules/s3/s3.service.ts
./src/modules/stores
./src/modules/stores/dto
./src/modules/stores/entities
./src/modules/stores/stores.controller.ts
./src/modules/stores/stores.module.ts
./src/modules/stores/stores.repository.ts
./src/modules/stores/stores.service.ts
./src/modules/users
./src/modules/users/dto
./src/modules/users/entities
./src/modules/users/users.controller.ts
./src/modules/users/users.module.ts
./src/modules/users/users.repository.ts
./src/modules/users/users.service.ts
./src/types
./src/types/.gitkeep
./src/types/express.d.ts
./src/types/jwt.d.ts
./src/utils
./src/utils/.gitkeep
./src/utils/docs-struct.ts
./src/utils/enum-mapper.ts
./src/utils/to-hash.ts
./src/utils/to-token.ts
./temp
./temp/file-structure.md
./temp/schema.md
./tsconfig.json
```
