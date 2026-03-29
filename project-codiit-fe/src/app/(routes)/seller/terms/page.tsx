export default function SellerTermsPage() {
  return (
    <div className="mx-auto max-w-[980px] px-6 py-10">
      <h1 className="text-3xl font-extrabold">판매자 이용약관</h1>
      <p className="mt-3 text-sm text-gray-500">시행일: 2026-03-26</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">1. 목적</h2>
        <p className="text-gray-800">
          본 약관은 판매자가 플랫폼에서 상품을 판매할 때 필요한 권리, 의무 및 책임 사항을 규정합니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">2. 판매자 정보 공개</h2>
        <p className="text-gray-800">
          판매자는 다음 정보가 구매자에게 공개될 수 있음을 이해하고 동의합니다.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-gray-800">
          <li>상호명, 대표자명</li>
          <li>사업자등록번호, 통신판매업 신고번호</li>
          <li>사업장 소재지, 사업자 연락처</li>
          <li>배송/교환/반품 관련 고지 정보</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">3. 정보의 진실성 및 최신성</h2>
        <p className="text-gray-800">
          판매자는 입력한 정보가 사실과 일치하도록 유지해야 하며, 변경 시 지체 없이 수정해야 합니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">4. 위반 시 조치</h2>
        <p className="text-gray-800">
          허위 정보 등록 또는 관련 법령 위반이 확인될 경우 서비스 이용 제한, 상품 노출 제한 등의 조치가 적용될 수 있습니다.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">5. 보관 및 파기 정책</h2>
        <p className="text-gray-800">
          판매자 정보 및 변경 이력은 관련 법령 및 내부 정책에 따라 일정 기간 보관 후 파기됩니다.
        </p>
      </section>
    </div>
  );
}
